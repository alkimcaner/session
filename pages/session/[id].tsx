import React, { useEffect, useState } from "react";
import CamFrame from "../../components/CamFrame";
import { IoCallOutline } from "react-icons/io5";
import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsVolumeUp,
  BsVolumeMute,
  BsClipboard,
} from "react-icons/bs";
import Link from "next/link";

export default function Session() {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [copyTooltip, setCopyTooltip] = useState("Copy session link");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const handleToggleAudio = () => {
    if (!localStream) return;
    setIsAudioEnabled((prev) => {
      localStream.getAudioTracks()[0].enabled = !prev;
      return !prev;
    });
  };

  const handleToggleVideo = () => {
    if (!localStream) return;
    setIsVideoEnabled((prev) => {
      localStream.getVideoTracks()[0].enabled = !prev;
      return !prev;
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopyTooltip("Copied!");
    setTimeout(() => setCopyTooltip("Copy session link"), 1000);
  };

  useEffect(() => {
    const openMediaDevices = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    };
    openMediaDevices();

    return () => localStream?.getTracks().forEach((track) => track.stop());
  }, []);

  return (
    <div>
      <main className="h-screen flex flex-col items-center justify-center gap-16">
        <ul className="flex justify-center items-center flex-wrap gap-4">
          {localStream ? (
            <CamFrame
              userName="flawn"
              stream={localStream}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              local
            />
          ) : (
            <img src="/loading.svg" alt="loading" />
          )}
        </ul>
        <ul className="fixed bottom-4 flex justify-center items-center gap-4 bg-base-300 py-4 px-8 rounded-xl z-20 shadow-lg">
          <li className="tooltip" data-tip={copyTooltip}>
            <button
              onClick={handleCopy}
              className="text-xl p-2 rounded-full hover:bg-base-100 hover:text-green-500"
            >
              <BsClipboard />
            </button>
          </li>
          <li className="tooltip" data-tip="Toggle video">
            <button
              onClick={handleToggleVideo}
              className="text-xl p-2 rounded-full hover:bg-base-100 hover:text-red-500"
            >
              {isVideoEnabled ? <BsCameraVideoOff /> : <BsCameraVideo />}
            </button>
          </li>
          <li className="tooltip" data-tip="Toggle audio">
            <button
              onClick={handleToggleAudio}
              className="text-xl p-2 rounded-full hover:bg-base-100 hover:text-red-500"
            >
              {isAudioEnabled ? <BsVolumeMute /> : <BsVolumeUp />}
            </button>
          </li>
          <li className="tooltip" data-tip="Leave session">
            <Link href="/">
              <div className="text-xl p-2 rounded-full bg-red-500 hover:bg-red-400">
                <IoCallOutline />
              </div>
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
