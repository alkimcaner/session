import React, { useEffect, useRef, useState } from "react";
import CamFrame from "../../components/CamFrame";
import { IoCallOutline } from "react-icons/io5";
import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsVolumeUp,
  BsVolumeMute,
  BsClipboard,
  BsChat,
} from "react-icons/bs";
import { MdFitScreen } from "react-icons/md";
import Link from "next/link";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { Database } from "../../types/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface IPeerData {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isConnected: boolean;
}

interface IChatMessage {
  user: string;
  message: string;
}

export default function Session() {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const localStreamRef = useRef<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const remoteStreamRef = useRef<MediaStream>();
  const [copyTooltip, setCopyTooltip] = useState("Copy session link");
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenEnabled, setIsScreenEnabled] = useState(false);
  const [localName, setLocalName] = useState("");
  const [remoteName, setRemoteName] = useState("");
  const candidates = useRef<RTCIceCandidate[]>([]);
  const dcAudio = useRef<HTMLAudioElement>();
  const [remotePeerData, setRemotePeerData] = useState<IPeerData>({
    isAudioEnabled: true,
    isVideoEnabled: true,
    isConnected: true,
  });
  const pc = useRef<RTCPeerConnection>();
  const peerDataChannel = useRef<RTCDataChannel>();
  const chatChannel = useRef<RTCDataChannel>();
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const chatElementRef = useRef<HTMLUListElement>(null);
  const supabaseRealtime = useRef<RealtimeChannel>();

  const handleShareScreen = async () => {
    try {
      let stream;
      if (!isScreenEnabled) {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setIsScreenEnabled(true);
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setIsScreenEnabled(false);
      }

      const track = stream.getVideoTracks()[0];

      const sender = pc.current
        ?.getSenders()
        .find((s) => s.track?.kind === track.kind);
      if (!sender) return;

      setLocalStream(stream);
      //Stop webcam
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = stream;
      //Replace tracks
      sender.replaceTrack(track);
    } catch (err) {
      console.error(err);
      return;
    }
  };

  const handleToggleAudio = () => {
    if (!localStream || !localStream.getAudioTracks()[0]) return;
    setIsAudioEnabled((prev) => {
      localStream.getAudioTracks()[0].enabled = !prev;
      if (peerDataChannel.current?.readyState === "open") {
        peerDataChannel.current?.send(
          JSON.stringify({
            isAudioEnabled: !prev,
            isVideoEnabled,
            isConnected: true,
          })
        );
      }
      return !prev;
    });
  };

  const handleToggleVideo = () => {
    if (!localStream || !localStream.getVideoTracks()[0]) return;
    setIsVideoEnabled((prev) => {
      localStream.getVideoTracks()[0].enabled = !prev;
      if (peerDataChannel.current?.readyState === "open") {
        peerDataChannel.current?.send(
          JSON.stringify({
            isAudioEnabled,
            isVideoEnabled: !prev,
            isConnected: true,
          })
        );
      }
      return !prev;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyTooltip("Copied!");
      setTimeout(() => setCopyTooltip("Copy session link"), 1000);
    } catch (err) {
      console.error(err);
      return;
    }
  };

  const handleSendMessage = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (peerDataChannel.current?.readyState !== "open" || messageInput === "")
      return;

    const message: IChatMessage = {
      user: localName,
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

  useEffect(() => {
    //Event handlers
    const handleOnDataChannel = (ev: RTCDataChannelEvent) => {
      if (ev.channel.label === "peerData") {
        peerDataChannel.current = ev.channel;
        peerDataChannel.current.addEventListener(
          "message",
          handleOnPeerDataMessage
        );
      } else if (ev.channel.label === "chat") {
        chatChannel.current = ev.channel;
        chatChannel.current.addEventListener("message", handleOnChatMessage);
      }
    };

    const handleOnPeerDataMessage = (ev: MessageEvent) => {
      const data: IPeerData = JSON.parse(ev.data);
      //Disconnect
      if (!data.isConnected) {
        dcAudio.current?.play();
        router.push("/");
      }

      setRemotePeerData(data);
    };

    const handleOnChatMessage = (ev: MessageEvent) => {
      const data: IChatMessage = JSON.parse(ev.data);
      setMessages((prev) => [...prev, data]);
    };

    const handleOnTrack = (ev: RTCTrackEvent) => {
      setRemoteStream(ev.streams[0]);
      remoteStreamRef.current = ev.streams[0];
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
          video: true,
          audio: true,
        });

        setLocalStream(stream);
        localStreamRef.current = stream;

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
        if (
          data.sdp?.type === "offer" &&
          data.caller_name !== localStorage.getItem("username")
        ) {
          //Set remote name
          setRemoteName(data.caller_name || "");

          const offerDescription = new RTCSessionDescription(data.sdp);
          await pc.current?.setRemoteDescription(offerDescription);

          const answerDescription = await pc.current?.createAnswer();
          await pc.current?.setLocalDescription(answerDescription);

          await supabase
            .from("sessions")
            .update({
              sdp: answerDescription,
              receiver_name: localStorage.getItem("username"),
            })
            .eq("session_id", data.session_id);

          supabaseRealtime.current = supabase
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
          peerDataChannel.current = pc.current?.createDataChannel("peerData");
          peerDataChannel.current?.addEventListener(
            "message",
            handleOnPeerDataMessage
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
              caller_name: localStorage.getItem("username"),
            })
            .eq("session_id", data.session_id);

          supabaseRealtime.current = supabase
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
                //Set remote name
                setRemoteName(payload.new.receiver_name);

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

    setLocalName(localStorage.getItem("username") || "");
    dcAudio.current = new Audio("/assets/disconnect.mp3");
    initSession();

    //Cleanup
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
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
      peerDataChannel.current?.removeEventListener(
        "message",
        handleOnPeerDataMessage
      );
      chatChannel.current?.removeEventListener("message", handleOnChatMessage);

      if (peerDataChannel.current?.readyState === "open") {
        peerDataChannel.current?.send(
          JSON.stringify({ isAudioEnabled, isVideoEnabled, isConnected: false })
        );
      }

      supabaseRealtime.current?.unsubscribe();
      peerDataChannel.current?.close();
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
          {localStream ? (
            <CamFrame
              username={localName}
              stream={localStream}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              local
            />
          ) : (
            <img src="/loading.svg" alt="loading" />
          )}
          {remoteStream && (
            <CamFrame
              username={remoteName}
              stream={remoteStream}
              isAudioEnabled={remotePeerData.isAudioEnabled}
              isVideoEnabled={remotePeerData.isVideoEnabled}
            />
          )}
        </ul>
        <div
          className={`fixed right-4 bg-base-300 p-4 h-1/2 w-72 flex flex-col gap-4 rounded-xl shadow-lg transition-all ease-in-out ${
            !isChatVisible && "invisible opacity-0 scale-95"
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
                disabled={!remoteStream}
              />
              <input
                type="submit"
                value="Chat"
                className="btn btn-square"
                disabled={!remoteStream}
              ></input>
            </div>
          </form>
        </div>
        <ul className="fixed bottom-4 flex justify-center items-center gap-4 bg-base-100 border border-neutral py-4 px-8 rounded-xl z-20 shadow-lg">
          <li className="tooltip" data-tip={copyTooltip}>
            <button
              onClick={handleCopy}
              className="text-xl p-2 rounded-full hover:text-secondary"
            >
              <BsClipboard />
            </button>
          </li>
          <li
            className="tooltip"
            data-tip={isChatVisible ? "Hide chat" : "Show chat"}
          >
            <button
              onClick={() => setIsChatVisible((prev) => !prev)}
              className="text-xl p-2 rounded-full hover:text-secondary"
            >
              <BsChat />
            </button>
          </li>
          <li className="tooltip" data-tip={"Share screen"}>
            <button
              onClick={handleShareScreen}
              className={`text-xl p-2 rounded-full hover:text-secondary ${
                isScreenEnabled && "bg-primary"
              }`}
            >
              <MdFitScreen />
            </button>
          </li>
          <li
            className="tooltip"
            data-tip={isVideoEnabled ? "Disable camera" : "Enable camera"}
          >
            <button
              onClick={handleToggleVideo}
              className="text-xl p-2 rounded-full hover:text-secondary"
            >
              {isVideoEnabled ? <BsCameraVideo /> : <BsCameraVideoOff />}
            </button>
          </li>
          <li
            className="tooltip"
            data-tip={
              isAudioEnabled ? "Disable microphone" : "Enable microphone"
            }
          >
            <button
              onClick={handleToggleAudio}
              className="text-xl p-2 rounded-full hover:text-secondary"
            >
              {isAudioEnabled ? <BsVolumeUp /> : <BsVolumeMute />}
            </button>
          </li>
          <li className="tooltip" data-tip="Leave session">
            <Link href="/">
              <div className="text-xl p-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-base-100">
                <IoCallOutline />
              </div>
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
