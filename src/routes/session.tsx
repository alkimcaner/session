import { useEffect, useRef, useState } from "react";
import CamFrame from "../components/CamFrame";
import {
  resetState,
  setLocalStream,
  addRemoteStream,
  setId,
} from "../slices/userSlice";
import ActionBar from "../components/ActionBar";
import { useAppDispatch, useAppSelector } from "../typedReduxHooks";
import { Peer } from "peerjs";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";

interface IRemoteInfo {
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
  const userState = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const params = useParams();
  const chatElementRef = useRef<HTMLUListElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [remoteInfo, setRemoteMeta] = useState<IRemoteInfo>({
    isAudioEnabled: true,
    isVideoEnabled: true,
    isCameraMirrored: false,
    isConnected: true,
    name: "",
  });
  const [peer] = useState(new Peer());

  // Scroll chat
  useEffect(() => {
    chatElementRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Get the user ID from PeerJS and set it to state
  useEffect(() => {
    peer.on("open", (id) => {
      dispatch(setId(id));
    });
  }, []);

  // Get mediastream
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: { ideal: userState.defaultVideoDeviceId } },
        audio: { deviceId: { ideal: userState.defaultAudioDeviceId } },
      })
      .then((stream) => {
        dispatch(setLocalStream(stream));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (!params.sessionId || !userState.id || !userState.localStream) return;

    const channel = supabase.channel(params.sessionId);

    peer.on("error", (err) => {
      console.log(err);
    });

    // If someone calls you, answer with your stream
    peer.on("call", (call) => {
      console.log("call received");
      call.answer(userState.localStream);
      call.on("stream", (remoteStream) => {
        dispatch(addRemoteStream({ id: call.peer, stream: remoteStream }));
      });
    });

    channel.on("broadcast", { event: "join" }, ({ payload }) => {
      console.log("joined: ", payload.peerId);
      // If another user joins the channel, call them with your stream
      if (payload.peerId !== userState.id && userState.localStream) {
        const call = peer.call(payload.peerId, userState.localStream);
        call.on("stream", (remoteStream) => {
          dispatch(
            addRemoteStream({ id: payload.peerId, stream: remoteStream })
          );
        });
      }
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // If you successfully subscribed to the channel, send a join message with your user ID
        channel.send({
          type: "broadcast",
          event: "join",
          payload: { peerId: userState.id },
        });
      }
    });

    return () => {
      channel.unsubscribe();
      dispatch(resetState());
      peer.destroy();
    };
  }, [params.sessionId, userState.id, userState.localStream]);

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="grid grid-cols-3 grid-rows-3 justify-center gap-4 w-full h-full">
        {userState.localStream ? (
          <CamFrame
            username="John Doe"
            stream={userState.localStream}
            isAudioEnabled={userState.isAudioEnabled}
            isVideoEnabled={userState.isVideoEnabled}
            mirror={userState.isCameraMirrored}
            local
          />
        ) : (
          <img src="/loading.svg" alt="loading" />
        )}
        {userState.remoteStreams.map((remoteStream, index) => (
          <CamFrame
            key={index}
            username={remoteInfo.name}
            stream={remoteStream.stream}
            isAudioEnabled={remoteInfo.isAudioEnabled}
            isVideoEnabled={remoteInfo.isVideoEnabled}
            mirror={remoteInfo.isCameraMirrored}
          />
        ))}
      </div>
      <div
        className={`fixed right-4 bg-base-300 p-4 h-1/2 w-72 flex flex-col gap-4 rounded-xl shadow-lg transition-all ease-in-out ${
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
        <form className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Send a message"
              className="input input-bordered w-full"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={!userState.remoteStreams.length}
            />
            <input
              type="submit"
              value="Chat"
              className="btn btn-square"
              disabled={!userState.remoteStreams.length}
            ></input>
          </div>
        </form>
      </div>
      <ActionBar />
    </main>
  );
}
