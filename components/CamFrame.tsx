import React, { useEffect, useRef } from "react";
import { BsCameraVideoOff, BsVolumeMute } from "react-icons/bs";

interface IProps {
  userName: string;
  stream: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  local?: boolean;
}

export default function CamFrame({
  userName,
  stream,
  isAudioEnabled,
  isVideoEnabled,
  local,
}: IProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <li className="relative w-96 aspect-video bg-base-300 rounded-xl overflow-hidden flex justify-center items-center shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        muted={local ? true : !isAudioEnabled}
      />

      {!isVideoEnabled && (
        <div className="text-2xl absolute">
          <BsCameraVideoOff />
        </div>
      )}

      <div className="absolute flex items-center gap-1 bottom-0 left-0 px-2 py-1 text-xs font-semibold bg-base-100 bg-opacity-70 rounded-tr-xl">
        {!isAudioEnabled && (
          <span className="text-red-500 text-base">
            <BsVolumeMute />
          </span>
        )}
        {userName}
      </div>
    </li>
  );
}
