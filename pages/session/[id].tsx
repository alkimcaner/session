import React, { useEffect, useRef, useState } from "react";
import CamFrame from "../../components/CamFrame";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { Database } from "../../types/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  setIsScreenShareEnabled,
  setLocalStream,
  setRemoteStream,
  stopLocalStream,
  stopRemoteStream,
} from "../../slices/userSlice";
import ActionBar from "../../components/ActionBar";

const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface IRemoteMeta {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isCameraMirrored: boolean;
  isConnected: boolean;
  name: string;
}

interface IChatMessage {
  user: string;
  message: string;
}

export default function Session() {
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const candidates = useRef<RTCIceCandidate[]>([]);
  const dcAudio = useRef<HTMLAudioElement>();
  const pc = useRef<RTCPeerConnection>();
  const metaChannel = useRef<RTCDataChannel>();
  const chatChannel = useRef<RTCDataChannel>();
  const rtEvent = useRef<RealtimeChannel>();
  const chatElementRef = useRef<HTMLUListElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [remoteMeta, setRemoteMeta] = useState<IRemoteMeta>({
    isAudioEnabled: true,
    isVideoEnabled: true,
    isCameraMirrored: false,
    isConnected: true,
    name: "",
  });

  const handleSendMessage = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (metaChannel.current?.readyState !== "open" || messageInput === "")
      return;

    const message: IChatMessage = {
      user: userState.name,
      message: messageInput,
    };

    setMessageInput("");
    setMessages((prev) => [...prev, message]);
    chatChannel.current?.send(JSON.stringify(message));
  };

  //Scroll chat
  useEffect(() => {
    chatElementRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  //Send metadata changes
  useEffect(() => {
    if (metaChannel.current?.readyState === "open") {
      metaChannel.current?.send(
        JSON.stringify({
          isAudioEnabled: userState.isAudioEnabled,
          isVideoEnabled: userState.isVideoEnabled,
          isCameraMirrored: userState.isCameraMirrored,
          isConnected: true,
          name: userState.name,
        })
      );
    }
  }, [
    userState.isVideoEnabled,
    userState.isAudioEnabled,
    userState.name,
    userState.isCameraMirrored,
  ]);

  useEffect(() => {
    //Event handlers
    const handleOnMetaChannelReady = () => {
      metaChannel.current?.send(
        JSON.stringify({
          isAudioEnabled: userState.isAudioEnabled,
          isVideoEnabled: userState.isVideoEnabled,
          isCameraMirrored: userState.isCameraMirrored,
          isConnected: true,
          name: userState.name,
        })
      );
    };

    const handleOnDataChannel = (ev: RTCDataChannelEvent) => {
      if (ev.channel.label === "meta") {
        metaChannel.current = ev.channel;
        metaChannel.current.addEventListener("message", handleOnMetaMessage);
        metaChannel.current.addEventListener("open", handleOnMetaChannelReady);
      } else if (ev.channel.label === "chat") {
        chatChannel.current = ev.channel;
        chatChannel.current.addEventListener("message", handleOnChatMessage);
      }
    };

    const handleOnMetaMessage = (ev: MessageEvent) => {
      const data: IRemoteMeta = JSON.parse(ev.data);
      //Disconnect
      if (!data.isConnected) {
        dcAudio.current?.play();
        router.push("/");
      }

      setRemoteMeta(data);
    };

    const handleOnChatMessage = (ev: MessageEvent) => {
      const data: IChatMessage = JSON.parse(ev.data);
      setMessages((prev) => [...prev, data]);
    };

    const handleOnTrack = (ev: RTCTrackEvent) => {
      dispatch(setRemoteStream(ev.streams[0]));
    };

    const handleOnIceCandidate = (ev: RTCPeerConnectionIceEvent) => {
      if (!ev.candidate) return;
      candidates.current?.push(ev.candidate);
    };

    const handleOnIceGatheringStateChange = async () => {
      try {
        if (pc.current?.iceGatheringState === "complete") {
          await supabase
            .from("sessions")
            .update({ ice: candidates.current })
            .eq("session_id", router.query.id);
        }
      } catch (err) {
        console.error(err);
        return;
      }
    };

    const handleOnConnectionStateChange = () => {
      if (
        pc.current?.connectionState === "closed" ||
        pc.current?.connectionState === "disconnected" ||
        pc.current?.connectionState === "failed"
      ) {
        router.push("/");
      }
    };

    //Initialize peer connection
    pc.current = new RTCPeerConnection(servers);
    //Set remote tracks
    pc.current?.addEventListener("track", handleOnTrack);
    //Go to homepage on disconnect
    pc.current?.addEventListener(
      "connectionstatechange",
      handleOnConnectionStateChange
    );
    //Listen for data channel
    pc.current?.addEventListener("datachannel", handleOnDataChannel);
    //Push ice candidates to an array
    pc.current?.addEventListener("icecandidate", handleOnIceCandidate);
    //Check if ice gathering is completed
    pc.current?.addEventListener(
      "icegatheringstatechange",
      handleOnIceGatheringStateChange
    );

    const initSession = async () => {
      if (!router.query.id) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { ideal: userState.defaultVideoDeviceId } },
          audio: { deviceId: { ideal: userState.defaultAudioDeviceId } },
        });

        dispatch(setLocalStream(stream));

        //Push tracks to connection
        stream
          .getTracks()
          .forEach((track) => pc.current?.addTrack(track, stream));

        const { data, error } = await supabase
          .from("sessions")
          .select()
          .eq("session_id", router.query.id)
          .single();

        if (error) return;

        //Answer
        if (data.sdp?.type === "offer" && data.caller_name !== userState.name) {
          const offerDescription = new RTCSessionDescription(data.sdp);
          await pc.current?.setRemoteDescription(offerDescription);

          const answerDescription = await pc.current?.createAnswer();
          await pc.current?.setLocalDescription(answerDescription);

          await supabase
            .from("sessions")
            .update({
              sdp: answerDescription,
              receiver_name: userState.name,
            })
            .eq("session_id", data.session_id);

          rtEvent.current = supabase
            .channel("public:sessions")
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "sessions",
                filter: `session_id=eq.${data.session_id}`,
              },
              (payload) => {
                const ice: RTCIceCandidate[] = payload.new.ice;
                if (ice?.length) {
                  ice.forEach((candidate) => {
                    pc.current?.addIceCandidate(candidate);
                  });
                }
              }
            )
            .subscribe();

          //Reload if caller is unavailable
          setTimeout(() => {
            if (pc.current?.connectionState !== "connected") {
              router.reload();
            }
          }, 2000);
        }
        //Offer
        else {
          //Initialize peer data channel
          metaChannel.current = pc.current?.createDataChannel("meta");
          metaChannel.current?.addEventListener("message", handleOnMetaMessage);
          metaChannel.current?.addEventListener(
            "open",
            handleOnMetaChannelReady
          );
          //Initialize chat channel
          chatChannel.current = pc.current?.createDataChannel("chat");
          chatChannel.current?.addEventListener("message", handleOnChatMessage);

          const offerDescription = await pc.current?.createOffer();
          await pc.current?.setLocalDescription(offerDescription);

          await supabase
            .from("sessions")
            .update({
              sdp: offerDescription,
              caller_name: userState.name,
            })
            .eq("session_id", data.session_id);

          rtEvent.current = supabase
            .channel("public:sessions")
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "sessions",
                filter: `session_id=eq.${data.session_id}`,
              },
              async (payload) => {
                if (payload.new.sdp) {
                  const answerDescription = new RTCSessionDescription(
                    payload.new.sdp
                  );
                  await pc.current?.setRemoteDescription(answerDescription);
                }
                const ice: RTCIceCandidate[] = payload.new.ice;
                if (ice?.length) {
                  ice.forEach((candidate) => {
                    pc.current?.addIceCandidate(candidate);
                  });
                }
              }
            )
            .subscribe();
        }
      } catch (err) {
        console.error(err);
        return;
      }
    };

    dcAudio.current = new Audio("/assets/disconnect.mp3");
    initSession();

    //Cleanup
    return () => {
      dispatch(stopLocalStream());
      dispatch(stopRemoteStream());
      dispatch(setLocalStream(undefined));
      dispatch(setRemoteStream(undefined));
      dispatch(setIsScreenShareEnabled(false));

      pc.current?.removeEventListener("icecandidate", handleOnIceCandidate);
      pc.current?.removeEventListener(
        "icegatheringstatechange",
        handleOnIceGatheringStateChange
      );
      pc.current?.removeEventListener("track", handleOnTrack);
      pc.current?.removeEventListener(
        "connectionstatechange",
        handleOnConnectionStateChange
      );
      pc.current?.removeEventListener("datachannel", handleOnDataChannel);
      metaChannel.current?.removeEventListener("message", handleOnMetaMessage);
      metaChannel.current?.removeEventListener(
        "open",
        handleOnMetaChannelReady
      );
      chatChannel.current?.removeEventListener("message", handleOnChatMessage);

      if (metaChannel.current?.readyState === "open") {
        metaChannel.current?.send(
          JSON.stringify({
            isAudioEnabled: userState.isAudioEnabled,
            isVideoEnabled: userState.isVideoEnabled,
            isCameraMirrored: userState.isCameraMirrored,
            isConnected: false,
            name: userState.name,
          })
        );
      }

      rtEvent.current?.unsubscribe();
      metaChannel.current?.close();
      chatChannel.current?.close();
      pc.current?.close();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Session</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-1 flex items-center justify-center gap-16 px-4">
        <ul className="flex flex-wrap justify-center items-center flex-col sm:flex-row gap-4 w-full h-full">
          {userState.localStream ? (
            <CamFrame
              username={userState.name}
              stream={userState.localStream}
              isAudioEnabled={userState.isAudioEnabled}
              isVideoEnabled={userState.isVideoEnabled}
              mirror={userState.isCameraMirrored}
              local
            />
          ) : (
            <img src="/loading.svg" alt="loading" />
          )}
          {userState.remoteStream && (
            <CamFrame
              username={remoteMeta.name}
              stream={userState.remoteStream}
              isAudioEnabled={remoteMeta.isAudioEnabled}
              isVideoEnabled={remoteMeta.isVideoEnabled}
              mirror={remoteMeta.isCameraMirrored}
            />
          )}
        </ul>
        <div
          className={`fixed right-4 bg-base-300 p-4 h-1/2 w-72 flex flex-col gap-4 rounded-xl shadow-lg border border-neutral transition-all ease-in-out ${
            !userState.isChatVisible && "invisible opacity-0 scale-95"
          }`}
        >
          <ul
            ref={chatElementRef}
            className="flex-1 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-secondary"
          >
            {messages.map((message, idx) => (
              <li key={idx} className="break-words">
                <b className="text-primary">{message.user}: </b>
                {message.message}
              </li>
            ))}
          </ul>
          <form onSubmit={handleSendMessage} className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Send a message"
                className="input input-bordered w-full"
                value={messageInput}
                onChange={(ev) => setMessageInput(ev.target.value)}
                disabled={!userState.remoteStream}
              />
              <input
                type="submit"
                value="Chat"
                className="btn btn-square"
                disabled={!userState.remoteStream}
              ></input>
            </div>
          </form>
        </div>
        <ActionBar pc={pc} />
      </main>
    </div>
  );
}
