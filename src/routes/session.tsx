import { useEffect, useRef, useState } from "react";
import CamFrame from "../components/CamFrame";
import {
  resetState,
  setLocalStream,
  addRemotePeer,
  setId,
  removeRemotePeer,
} from "../slices/userSlice";
import ActionBar from "../components/ActionBar";
import { useAppDispatch, useAppSelector } from "../typedReduxHooks";
import { Peer } from "peerjs";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";

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
  const [peer] = useState(new Peer());
  const channel = useRef(supabase.channel(params.sessionId!));

  useEffect(() => {
    channel.current.subscribe();
    return () => {
      channel.current.unsubscribe();
    };
  }, []);

  // Scroll chat
  useEffect(() => {
    chatElementRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Get the user ID from PeerJS and set it to state
  useEffect(() => {
    if (!peer.id) return;
    dispatch(setId(peer.id));
  }, [peer.id]);

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

    peer.on("error", (err) => {
      console.error(err);
    });

    // Listen for data connection
    peer.on("connection", (conn) => {
      // Remove peer on close
      conn.on("close", () => dispatch(removeRemotePeer(conn.peer)));
    });

    // Destroy the connection when the user closes browser tab
    window.onbeforeunload = () => peer.destroy();

    // If someone calls you, answer with your stream
    peer.on("call", (call) => {
      call.answer(userState.localStream);
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

    channel.current.on("broadcast", { event: "join" }, ({ payload }) => {
      // If another user joins the channel, call them with your stream
      if (payload !== userState.id && userState.localStream) {
        // Start a data connection
        const conn = peer.connect(payload);
        // Remove peer on close
        conn.on("close", () => dispatch(removeRemotePeer(payload)));
        // Call
        const call = peer.call(payload, userState.localStream);
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

    return () => {
      dispatch(resetState());
      peer.destroy();
    };
  }, [params.sessionId, userState.id, userState.localStream]);

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
      <div className="grid grid-cols-3 justify-center gap-4 px-4 h-full w-full">
        {userState.localStream && (
          <CamFrame
            username={userState.name}
            stream={userState.localStream}
            isAudioEnabled={userState.isAudioEnabled}
            isVideoEnabled={userState.isVideoEnabled}
            mirror={userState.isCameraMirrored}
            local
          />
        )}

        {userState.remotePeers.map((remotePeer) => (
          <CamFrame
            key={remotePeer.id}
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
