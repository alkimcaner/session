import Link from "next/link";
import React, { useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
  setIsScreenEnabled,
  setLocalStream,
  stopLocalStream,
  toggleAudio,
  toggleChat,
  toggleVideo,
} from "../slices/userSlice";
import { RootState } from "../store";

interface IProps {
  pc: React.MutableRefObject<RTCPeerConnection | undefined>;
}

export default function ActionBar({ pc }: IProps) {
  const [copyTooltip, setCopyTooltip] = useState("Copy session link");
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

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

  const handleShareScreen = async () => {
    try {
      let stream;
      if (!userState.isScreenEnabled) {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        dispatch(setIsScreenEnabled(true));
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        dispatch(setIsScreenEnabled(false));
      }

      const track = stream.getVideoTracks()[0];

      const sender = pc.current
        ?.getSenders()
        .find((s) => s.track?.kind === track.kind);
      if (!sender) return;

      //Stop webcam
      dispatch(stopLocalStream());

      //Set stream
      dispatch(setLocalStream(stream));

      //Replace tracks
      sender.replaceTrack(track);
    } catch (err) {
      console.error(err);
      return;
    }
  };

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
          onClick={handleShareScreen}
          className={`text-xl p-2 rounded-full hover:text-secondary ${
            userState.isScreenEnabled && "bg-neutral-focus"
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
