import { useEffect, useRef, useState } from "react";
import CamFrame from "../components/CamFrame";
import {
  resetState,
  addRemotePeer,
  setId,
  removeRemotePeer,
} from "../slices/userSlice";
import ActionBar from "../components/ActionBar";
import { useAppDispatch, useAppSelector } from "../hooks/typedReduxHooks";
import { MediaConnection, Peer } from "peerjs";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import useMediaStream from "../hooks/useMediaStream";

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
  const peer = useRef<Peer>(new Peer());
  const channel = useRef(supabase.channel(params.sessionId!));
  const mediaConnections = useRef<MediaConnection[]>([]);
  const localStream = useMediaStream();

  // Scroll chat
  useEffect(() => {
    chatElementRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    channel.current.subscribe();
    return () => {
      channel.current.unsubscribe();
      dispatch(resetState());
      peer.current.destroy();
    };
  }, []);

  // Get the user ID from PeerJS and set it to state
  useEffect(() => {
    if (!localStream) return;

    peer.current.destroy();
    peer.current = new Peer();
    peer.current.on("open", () => dispatch(setId(peer.current.id)));
  }, [localStream]);

  // Initialize connection
  useEffect(() => {
    if (!params.sessionId || !userState.id || !localStream) return;

    peer.current.on("error", (err) => {
      console.error(err);
    });

    // Listen for data connection
    peer.current.on("connection", (conn) => {
      // Remove peer on close
      conn.on("close", () => dispatch(removeRemotePeer(conn.peer)));
    });

    // Destroy the connection when the user closes browser tab
    window.onbeforeunload = () => peer.current.destroy();

    // If someone calls you, answer with your stream
    peer.current.on("call", (call) => {
      mediaConnections.current.push(call);

      call.answer(localStream);
      call.on("stream", (remoteStream) => {
        dispatch(
          addRemotePeer({
            id: call.peer,
            stream: remoteStream,
            name: "",
            isVideoEnabled: false,
            isAudioEnabled: false,
            isCameraMirrored: false,
          })
        );
        // Send data
        setTimeout(() => {
          channel.current.send({
            type: "broadcast",
            event: "data",
            payload: {
              id: userState.id,
              name: userState.name,
              isVideoEnabled: userState.isVideoEnabled,
              isAudioEnabled: userState.isAudioEnabled,
              isCameraMirrored: userState.isCameraMirrored,
            },
          });
        }, 500);
      });
    });

    // If another user joins the channel, call them with your stream
    channel.current.on("broadcast", { event: "join" }, ({ payload }) => {
      if (payload !== userState.id && localStream) {
        // Start a data connection
        const conn = peer.current.connect(payload);
        // Remove peer on close
        conn.on("close", () => dispatch(removeRemotePeer(payload)));
        // Call
        const call = peer.current.call(payload, localStream);
        mediaConnections.current.push(call);

        call.on("stream", (remoteStream) => {
          dispatch(
            addRemotePeer({
              id: payload,
              stream: remoteStream,
              name: "",
              isVideoEnabled: false,
              isAudioEnabled: false,
              isCameraMirrored: false,
            })
          );
          // Send data
          setTimeout(() => {
            channel.current.send({
              type: "broadcast",
              event: "data",
              payload: {
                id: userState.id,
                name: userState.name,
                isVideoEnabled: userState.isVideoEnabled,
                isAudioEnabled: userState.isAudioEnabled,
                isCameraMirrored: userState.isCameraMirrored,
              },
            });
          }, 500);
        });
      }
    });

    channel.current.on("broadcast", { event: "data" }, ({ payload }) => {
      // If another user sends data event, update the state
      dispatch(
        addRemotePeer({
          id: payload.id,
          stream: undefined,
          name: payload.name,
          isVideoEnabled: payload.isVideoEnabled,
          isAudioEnabled: payload.isAudioEnabled,
          isCameraMirrored: payload.isCameraMirrored,
        })
      );
    });

    // If you successfully subscribed to the channel, send a join message with your user ID
    channel.current.send({
      type: "broadcast",
      event: "join",
      payload: userState.id,
    });
  }, [params.sessionId, userState.id]);

  // Send data when the state has changed
  useEffect(() => {
    if (!userState.id) return;
    channel.current.send({
      type: "broadcast",
      event: "data",
      payload: {
        id: userState.id,
        name: userState.name,
        isVideoEnabled: userState.isVideoEnabled,
        isAudioEnabled: userState.isAudioEnabled,
        isCameraMirrored: userState.isCameraMirrored,
      },
    });
  }, [
    userState.id,
    userState.name,
    userState.isVideoEnabled,
    userState.isAudioEnabled,
    userState.isCameraMirrored,
  ]);

  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="grid sm:grid-cols-4 sm:grid-rows-3 justify-center items-center gap-4 px-4 h-full w-full">
        {localStream ? (
          <CamFrame
            id={userState.id}
            username={userState.name}
            stream={localStream}
            isAudioEnabled={userState.isAudioEnabled}
            isVideoEnabled={userState.isVideoEnabled}
            mirror={userState.isCameraMirrored}
            local
          />
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <img src="/loading.svg" alt="loading" />
          </div>
        )}

        {userState.remotePeers.map((remotePeer) => (
          <CamFrame
            key={remotePeer.id}
            id={remotePeer.id}
            username={remotePeer.name}
            stream={remotePeer.stream}
            isAudioEnabled={remotePeer.isAudioEnabled}
            isVideoEnabled={remotePeer.isVideoEnabled}
            mirror={remotePeer.isCameraMirrored}
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
              disabled={!userState.remotePeers.length}
            />
            <input
              type="submit"
              value="Chat"
              className="btn btn-square"
              disabled={!userState.remotePeers.length}
            ></input>
          </div>
        </form>
      </div>
      <ActionBar />
    </main>
  );
}
