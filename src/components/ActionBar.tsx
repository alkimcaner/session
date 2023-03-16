import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  BsArrowDownShort,
  BsArrowUpShort,
  BsCameraVideo,
  BsCameraVideoOff,
  BsChat,
  BsClipboard,
  BsEyeSlashFill,
  BsVolumeMute,
  BsVolumeUp,
} from "react-icons/bs";
import { MdFitScreen } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import {
  setIsScreenShareEnabled,
  setIsChatVisible,
  setIsAudioEnabled,
  setIsVideoEnabled,
  setFocus,
} from "../slices/userSlice";
import { useAppDispatch, useAppSelector } from "../typedReduxHooks";

interface IProps {
  pc: React.MutableRefObject<RTCPeerConnection | undefined>;
}

export default function ActionBar() {
  const [copyTooltip, setCopyTooltip] = useState("Copy session link");
  const userState = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [isHidden, setIsHidden] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyTooltip("Copied!");
      setTimeout(() => setCopyTooltip("Copy session link"), 1000);
    } catch (err) {
      console.error(err);
    }
  };

  // //Update the local stream when the default device changes
  // useEffect(() => {
  //   dispatch(updateLocalStream({ screen: false }));
  // }, [userState.defaultAudioDeviceId, userState.defaultVideoDeviceId]);

  // //Update the local stream when the screen share state changes
  // useEffect(() => {
  //   if (userState.isScreenShareEnabled) {
  //     dispatch(updateLocalStream({ screen: true }));
  //   } else {
  //     dispatch(updateLocalStream({ screen: false }));
  //   }
  // }, [userState.isScreenShareEnabled]);

  return (
    <ul
      className={`fixed ${
        isHidden ? "-bottom-16" : "bottom-8"
      } flex justify-center items-center gap-1 z-20 p-2 bg-base-300 shadow-xl rounded-btn transition-[bottom]`}
    >
      <button
        onClick={() => setIsHidden(!isHidden)}
        className="absolute -top-12 btn btn-circle btn-sm text-xl"
      >
        {isHidden ? <BsArrowUpShort /> : <BsArrowDownShort />}
      </button>
      <li>
        <button
          onClick={() => dispatch(setFocus(undefined))}
          className={`btn ${
            userState.focus === undefined ? "hidden" : "inline-flex"
          } gap-2`}
        >
          <BsEyeSlashFill />
          Stop Focusing
        </button>
      </li>
      <li className="tooltip" data-tip={copyTooltip}>
        <button
          onClick={handleCopy}
          className="text-lg btn btn-square btn-ghost"
        >
          <BsClipboard />
        </button>
      </li>
      <li
        className="tooltip"
        data-tip={userState.isChatVisible ? "Hide chat" : "Show chat"}
      >
        <button
          onClick={() => dispatch(setIsChatVisible(!userState.isChatVisible))}
          className={`text-lg btn btn-square ${
            userState.isChatVisible ? "btn-primary" : "btn-ghost"
          }`}
        >
          <BsChat />
        </button>
      </li>
      <li className="tooltip hidden sm:inline-block" data-tip={"Share screen"}>
        <button
          onClick={() =>
            dispatch(setIsScreenShareEnabled(!userState.isScreenShareEnabled))
          }
          className={`text-lg btn btn-square ${
            userState.isScreenShareEnabled ? "btn-primary" : "btn-ghost"
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
          onClick={() => dispatch(setIsVideoEnabled(!userState.isVideoEnabled))}
          className={`text-lg btn btn-square ${
            userState.isVideoEnabled ? "btn-ghost" : "btn-error"
          }`}
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
          onClick={() => dispatch(setIsAudioEnabled(!userState.isAudioEnabled))}
          className={`text-lg btn btn-square ${
            userState.isAudioEnabled ? "btn-ghost" : "btn-error"
          }`}
        >
          {userState.isAudioEnabled ? <BsVolumeUp /> : <BsVolumeMute />}
        </button>
      </li>
      <li className="tooltip" data-tip="Leave session">
        <Link to="/">
          <div className="text-lg btn btn-square btn-error">
            <IoCallOutline />
          </div>
        </Link>
      </li>
    </ul>
  );
}
