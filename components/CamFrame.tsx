import React, { useEffect, useRef } from "react";
import { BsCameraVideoOff, BsVolumeMute, BsEyeFill } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setFocus } from "../slices/userSlice";

interface IProps {
  username: string;
  stream: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  mirror: boolean;
  local?: boolean;
}

export default function CamFrame({
  username,
  stream,
  isAudioEnabled,
  isVideoEnabled,
  mirror,
  local,
}: IProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userState = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  const frameSize = () => {
    if (userState.focus === "local" && local) {
      return "max-w-[75%]";
    } else if (userState.focus === "remote" && !local) {
      return "max-w-[75%]";
    } else if (userState.focus === undefined) {
      return "max-w-[100%]";
    } else {
      return "max-w-[25%]";
    }
  };

  return (
    <div
      className={`group relative flex-1 ${frameSize()} w-full h-full aspect-video bg-base-300 rounded-xl overflow-hidden flex justify-center items-center shadow-lg`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        muted={local ? true : !isAudioEnabled}
        className={`w-full ${mirror && "-scale-x-100"} ${
          !isVideoEnabled && "hidden"
        }`}
      />

      {!isVideoEnabled && (
        <div className="text-2xl text-base-content absolute">
          <BsCameraVideoOff />
        </div>
      )}

      <div className="absolute flex items-center gap-1 bottom-1 left-1 px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded-lg">
        {!isAudioEnabled && (
          <span className="text-red-500 text-base">
            <BsVolumeMute />
          </span>
        )}
        {username}
      </div>

      <div
        className={`tooltip tooltip-left absolute bottom-1 right-1 hidden sm:inline-block ${
          userState.focus !== undefined && "sm:hidden"
        }`}
        data-tip="Focus"
      >
        <button
          onClick={() => {
            if (local) {
              dispatch(setFocus("local"));
            } else {
              dispatch(setFocus("remote"));
            }
          }}
          className="btn btn-sm btn-square"
        >
          <BsEyeFill />
        </button>
      </div>
    </div>
  );
}
