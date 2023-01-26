import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsChat,
  BsClipboard,
  BsVolumeMute,
  BsVolumeUp,
} from "react-icons/bs";
import { MdFitScreen } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import {
  toggleAudio,
  toggleChat,
  toggleVideo,
  updateLocalStream,
} from "../slices/userSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

interface IProps {
  pc: React.MutableRefObject<RTCPeerConnection | undefined>;
}

export default function ActionBar({ pc }: IProps) {
  const [copyTooltip, setCopyTooltip] = useState("Copy session link");
  const userState = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyTooltip("Copied!");
      setTimeout(() => setCopyTooltip("Copy session link"), 1000);
    } catch (err) {
      console.error(err);
    }
  };

  //Update the local stream when the default device changes
  useEffect(() => {
    dispatch(updateLocalStream({ pc: pc.current, screen: false }));
  }, [userState.defaultAudioDeviceId, userState.defaultVideoDeviceId]);

  return (
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
        data-tip={userState.isChatVisible ? "Hide chat" : "Show chat"}
      >
        <button
          onClick={() => dispatch(toggleChat())}
          className="text-xl p-2 rounded-full hover:text-secondary"
        >
          <BsChat />
        </button>
      </li>
      <li className="tooltip" data-tip={"Share screen"}>
        <button
          onClick={() =>
            dispatch(updateLocalStream({ pc: pc.current, screen: true }))
          }
          className={`text-xl p-2 rounded-full hover:text-secondary ${
            userState.isScreenShareEnabled && "bg-neutral-focus"
          }`}
        >
          <MdFitScreen />
        </button>
      </li>
      <li
        className="tooltip"
        data-tip={userState.isVideoEnabled ? "Disable camera" : "Enable camera"}
      >
        <button
          onClick={() => dispatch(toggleVideo())}
          className="text-xl p-2 rounded-full hover:text-secondary"
        >
          {userState.isVideoEnabled ? <BsCameraVideo /> : <BsCameraVideoOff />}
        </button>
      </li>
      <li
        className="tooltip"
        data-tip={
          userState.isAudioEnabled ? "Disable microphone" : "Enable microphone"
        }
      >
        <button
          onClick={() => dispatch(toggleAudio())}
          className="text-xl p-2 rounded-full hover:text-secondary"
        >
          {userState.isAudioEnabled ? <BsVolumeUp /> : <BsVolumeMute />}
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
  );
}
