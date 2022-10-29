import React, { useEffect, useState } from "react";
import CamFrame from "../../components/CamFrame";
import { IoCallOutline } from "react-icons/io5";
import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsVolumeUp,
  BsVolumeMute,
} from "react-icons/bs";
import Link from "next/link";

interface IConstraints {
  video: boolean;
  audio: boolean;
}

export default function Session() {
  const [constraints, setConstraints] = useState<IConstraints>({
    video: true,
    audio: true,
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const openMediaDevices = async () => {
      if (constraints.audio === false && constraints.video === false)
        return setLocalStream(null);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
    };
    openMediaDevices();
  }, [constraints]);

  return (
    <div>
      <main className="h-screen flex flex-col items-center justify-center gap-16">
        <ul className="flex justify-center items-center flex-wrap gap-4">
          <CamFrame
            userName="flawn"
            srcObject={localStream}
            constraints={constraints}
            local
          />
        </ul>
        <ul className="fixed bottom-4 flex justify-center items-center gap-4 bg-base-300 py-4 px-8 rounded-full z-20 shadow-lg shadow-black">
          <li className="tooltip" data-tip="Toggle video">
            <button
              onClick={() =>
                setConstraints((prev) => {
                  return { ...prev, video: !prev.video };
                })
              }
              className="text-xl p-2 rounded-full hover:bg-base-100 hover:text-red-500"
            >
              {constraints.video ? <BsCameraVideoOff /> : <BsCameraVideo />}
            </button>
          </li>
          <li className="tooltip" data-tip="Toggle audio">
            <button
              onClick={() =>
                setConstraints((prev) => {
                  return { ...prev, audio: !prev.audio };
                })
              }
              className="text-xl p-2 rounded-full hover:bg-base-100 hover:text-red-500"
            >
              {constraints.audio ? <BsVolumeMute /> : <BsVolumeUp />}
            </button>
          </li>
          <li className="tooltip" data-tip="Leave session">
            <Link href="/">
              <div className="text-xl p-2 rounded-full hover:bg-base-100 hover:text-red-500">
                <IoCallOutline />
              </div>
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
