import React, { useEffect, useRef } from "react";
import { BsCameraVideoOff, BsVolumeMute } from "react-icons/bs";

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

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <li className="relative max-w-2xl flex-1 aspect-video bg-base-300 rounded-xl overflow-hidden flex justify-center items-center shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        muted={local ? true : !isAudioEnabled}
        className={`w-full ${mirror && "-scale-x-100"}`}
      />

      {!isVideoEnabled && (
        <div className="text-2xl text-white absolute">
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
    </li>
  );
}
