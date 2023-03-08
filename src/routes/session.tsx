import { useEffect, useRef, useState } from "react";
import CamFrame from "../components/CamFrame";
import {
  resetState,
  setLocalStream,
  setRemoteStream,
} from "../slices/userSlice";
import ActionBar from "../components/ActionBar";
import { useAppDispatch, useAppSelector } from "../typedReduxHooks";
import { Peer } from "peerjs";

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

  //Scroll chat
  useEffect(() => {
    chatElementRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  //Initialize session
  useEffect(() => {
    //Cleanup
    return () => {
      dispatch(resetState());
    };
  }, []);

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="flex flex-wrap justify-center flex-col sm:flex-row gap-4 w-full h-full">
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
        {userState.remoteStream && (
          <CamFrame
            username={remoteInfo.name}
            stream={userState.remoteStream}
            isAudioEnabled={remoteInfo.isAudioEnabled}
            isVideoEnabled={remoteInfo.isVideoEnabled}
            mirror={remoteInfo.isCameraMirrored}
          />
        )}
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
      {/* <ActionBar /> */}
    </main>
  );
}
