import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "./typedReduxHooks";
import { setIsScreenShareEnabled } from "../slices/userSlice";

export default function useMediaStream() {
  const userState = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [stream, setStream] = useState<MediaStream>();
  const streamRef = useRef<MediaStream>();

  useEffect(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());

    if (userState.isScreenShareEnabled) {
      navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          setStream(stream);
          streamRef.current = stream;

          const videoTrack = stream.getVideoTracks()[0];
          videoTrack.onended = () => dispatch(setIsScreenShareEnabled(false));
        });
    } else {
      navigator.mediaDevices
        .getUserMedia({
          video: { deviceId: { ideal: userState.defaultVideoDeviceId } },
          audio: { deviceId: { ideal: userState.defaultAudioDeviceId } },
        })
        .then((stream) => {
          setStream(stream);
          streamRef.current = stream;
        });
    }

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [
    userState.defaultVideoDeviceId,
    userState.defaultAudioDeviceId,
    userState.isScreenShareEnabled,
  ]);

  useEffect(() => {
    if (!stream) return;
    stream.getAudioTracks()[0].enabled = userState.isAudioEnabled;
  }, [userState.isAudioEnabled]);

  useEffect(() => {
    if (!stream) return;
    stream.getVideoTracks()[0].enabled = userState.isVideoEnabled;
  }, [userState.isVideoEnabled]);

  return stream;
}
