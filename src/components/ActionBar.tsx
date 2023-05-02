import { Link, useParams } from "react-router-dom";
import React, { useState } from "react";
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
import { useAppDispatch, useAppSelector } from "../hooks/typedReduxHooks";

export default function ActionBar() {
  const [copyTooltip, setCopyTooltip] = useState("Copy session code");
  const userState = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const params = useParams();
  const [isHidden, setIsHidden] = useState(false);

  const handleCopy = async () => {
    try {
      if (!params.sessionId) return;
      await navigator.clipboard.writeText(params.sessionId);
      setCopyTooltip("Copied!");
      setTimeout(() => setCopyTooltip("Copy session code"), 1000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ul
      className={`fixed ${
        isHidden ? "-bottom-16" : "bottom-8"
      } rounded-btn z-20 flex items-center justify-center gap-1 bg-base-300 p-2 shadow-xl transition-[bottom]`}
    >
      <button
        onClick={() => setIsHidden(!isHidden)}
        className="btn-sm btn-circle btn absolute -top-12 text-xl"
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
          className="btn-ghost btn-square btn text-lg"
        >
          <BsClipboard />
        </button>
      </li>
      <li
        className="tooltip indicator"
        data-tip={userState.isChatVisible ? "Hide chat" : "Show chat"}
      >
        {userState.unreadMessages > 0 && (
          <span className="badge-secondary badge indicator-bottom indicator-item select-none">
            {userState.unreadMessages}
          </span>
        )}
        <button
          onClick={() => dispatch(setIsChatVisible(!userState.isChatVisible))}
          className={`btn-square btn text-lg ${
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
          className={`btn-square btn text-lg ${
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
          className={`btn-square btn text-lg ${
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
          className={`btn-square btn text-lg ${
            userState.isAudioEnabled ? "btn-ghost" : "btn-error"
          }`}
        >
          {userState.isAudioEnabled ? <BsVolumeUp /> : <BsVolumeMute />}
        </button>
      </li>
      <li className="tooltip" data-tip="Leave session">
        <Link to="/">
          <div className="btn-error btn-square btn text-lg">
            <IoCallOutline />
          </div>
        </Link>
      </li>
    </ul>
  );
}
