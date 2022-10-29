import React, { useEffect, useRef } from "react";
import { BsCameraVideoOff, BsVolumeMute } from "react-icons/bs";

interface IProps {
  userName: string;
  srcObject: MediaStream | null;
  constraints: { video: boolean; audio: boolean };
  local?: boolean;
}

export default function CamFrame({
  userName,
  srcObject,
  constraints,
  local,
}: IProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = srcObject;
  }, [srcObject]);

  const VideoStream = () => {
    if (!srcObject && constraints.video)
      return <img src="/loading.svg" alt="loading" />;
    else if (!constraints.video)
      return (
        <span className="text-2xl">
          <BsCameraVideoOff />
        </span>
      );
    else
      return (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls={false}
          muted={local ? true : !constraints.audio}
        />
      );
  };

  return (
    <li className="relative w-96 aspect-video bg-base-300 rounded-xl overflow-hidden flex justify-center items-center shadow-lg shadow-black">
      <VideoStream />
      <span className="absolute flex items-center gap-1 bottom-0 left-0 px-2 py-1 text-xs font-semibold bg-base-300 bg-opacity-70 rounded-tr-xl">
        {!constraints.audio && (
          <span className="text-red-500 text-base">
            <BsVolumeMute />
          </span>
        )}
        {userName}
      </span>
    </li>
  );
}
