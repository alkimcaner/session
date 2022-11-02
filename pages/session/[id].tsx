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
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import Head from "next/head";
import Navbar from "../../components/Navbar";

const nameGenConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: " ",
  length: 2,
  style: "capital",
};

const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const connection = new RTCPeerConnection(servers);

export default function Session() {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>(
    new MediaStream()
  );
  const [copyTooltip, setCopyTooltip] = useState("Copy session link");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [userName, setUserName] = useState(uniqueNamesGenerator(nameGenConfig));

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
      //Set local stream
      setLocalStream(stream);
      //Push tracks to connection
      stream.getTracks().forEach((track) => connection.addTrack(track, stream));
      //Set remote stream
      connection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
    };

    openMediaDevices();

    return () => {
      localStream?.getTracks().forEach((track) => {
        track.stop();
      });
      remoteStream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  return (
    <div>
      <Head>
        <title>Session</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="h-screen flex flex-col items-center justify-center gap-16">
        <ul className="flex justify-center items-center flex-wrap gap-4">
          {localStream ? (
            <CamFrame
              userName={userName}
              stream={localStream}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              local
            />
          ) : (
            <img src="/loading.svg" alt="loading" />
          )}
        </ul>
        <ul className="fixed bottom-4 flex justify-center items-center gap-4 bg-base-100 border border-primary py-4 px-8 rounded-xl z-20 shadow-lg">
          <li className="tooltip" data-tip={copyTooltip}>
            <button
              onClick={handleCopy}
              className="text-xl p-2 rounded-full hover:text-green-500"
            >
              <BsClipboard />
            </button>
          </li>
          <li
            className="tooltip"
            data-tip={isVideoEnabled ? "Disable camera" : "Enable camera"}
          >
            <button
              onClick={handleToggleVideo}
              className="text-xl p-2 rounded-full hover:text-blue-500"
            >
              {isVideoEnabled ? <BsCameraVideo /> : <BsCameraVideoOff />}
            </button>
          </li>
          <li
            className="tooltip"
            data-tip={
              isAudioEnabled ? "Disable microphone" : "Enable microphone"
            }
          >
            <button
              onClick={handleToggleAudio}
              className="text-xl p-2 rounded-full hover:text-red-500"
            >
              {isAudioEnabled ? <BsVolumeUp /> : <BsVolumeMute />}
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
      </main>
    </div>
  );
}
