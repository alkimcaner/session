import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import Cookies from "js-cookie";

const theme = Cookies.get("theme");
let defaultAudioDeviceId;
let defaultVideoDeviceId;
let isCameraMirrored;

//Get localstorage
if (typeof window !== "undefined" && window.localStorage) {
  defaultAudioDeviceId = localStorage.getItem("defaultAudioDeviceId");
  defaultVideoDeviceId = localStorage.getItem("defaultVideoDeviceId");
  isCameraMirrored = localStorage.getItem("isCameraMirrored") === "true";
}

export interface UserState {
  localStream: MediaStream | undefined;
  remoteStream: MediaStream | undefined;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenShareEnabled: boolean;
  isChatVisible: boolean;
  isPermissionsGranted: boolean;
  defaultAudioDeviceId: string;
  defaultVideoDeviceId: string;
  isCameraMirrored: boolean;
  theme: string;
  focus: "local" | "remote" | undefined;
}

const initialState: UserState = {
  localStream: undefined,
  remoteStream: undefined,
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenShareEnabled: false,
  isChatVisible: false,
  isPermissionsGranted: false,
  defaultAudioDeviceId: defaultAudioDeviceId || "default",
  defaultVideoDeviceId: defaultVideoDeviceId || "",
  isCameraMirrored: isCameraMirrored || false,
  theme: theme || "",
  focus: undefined,
};

export const updateLocalStream = createAsyncThunk<
  MediaStream | undefined,
  { pc: RTCPeerConnection | undefined; screen: boolean },
  { dispatch: AppDispatch; state: RootState }
>("user/updateLocalStream", async ({ pc, screen }, { dispatch, getState }) => {
  try {
    let stream: MediaStream;

    const videoSender = pc?.getSenders().find((s) => s.track?.kind === "video");

    const audioSender = pc?.getSenders().find((s) => s.track?.kind === "audio");

    if (screen) {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      dispatch(setIsCameraMirrored(false));
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { ideal: getState().user.defaultVideoDeviceId } },
        audio: { deviceId: { ideal: getState().user.defaultAudioDeviceId } },
      });

      dispatch(setIsScreenShareEnabled(false));
    }

    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    //Stop screen share if mediastream ends
    videoTrack.onended = () => dispatch(setIsScreenShareEnabled(false));

    //Stop stream
    dispatch(stopLocalStream());

    //Replace video track
    videoSender?.replaceTrack(videoTrack);

    //Replace audio track
    audioSender?.replaceTrack(audioTrack);

    return stream;
  } catch (err) {
    dispatch(setIsScreenShareEnabled(false));
    console.error(err);
  }
});

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLocalStream: (state, action: PayloadAction<MediaStream | undefined>) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (
      state,
      action: PayloadAction<MediaStream | undefined>
    ) => {
      state.remoteStream = action.payload;
    },
    stopLocalStream: (state) => {
      state.localStream?.getTracks().forEach((track) => track.stop());
    },
    stopRemoteStream: (state) => {
      state.remoteStream?.getTracks().forEach((track) => track.stop());
    },
    setIsVideoEnabled: (state, action: PayloadAction<boolean>) => {
      if (!state.localStream || !state.localStream.getVideoTracks()[0]) return;
      state.localStream.getVideoTracks()[0].enabled = action.payload;
      state.isVideoEnabled = action.payload;
    },
    setIsAudioEnabled: (state, action: PayloadAction<boolean>) => {
      if (!state.localStream || !state.localStream.getAudioTracks()[0]) return;
      state.localStream.getAudioTracks()[0].enabled = action.payload;
      state.isAudioEnabled = action.payload;
    },
    setIsChatVisible: (state, action: PayloadAction<boolean>) => {
      state.isChatVisible = action.payload;
    },
    setIsScreenShareEnabled: (state, action: PayloadAction<boolean>) => {
      state.isScreenShareEnabled = action.payload;
    },
    setIsPermissionsGranted: (state, action: PayloadAction<boolean>) => {
      state.isPermissionsGranted = action.payload;
    },
    setDefaultAudioDeviceId: (state, action: PayloadAction<string>) => {
      localStorage.setItem("defaultAudioDeviceId", action.payload);
      state.defaultAudioDeviceId = action.payload;
    },
    setDefaultVideoDeviceId: (state, action: PayloadAction<string>) => {
      localStorage.setItem("defaultVideoDeviceId", action.payload);
      state.defaultVideoDeviceId = action.payload;
    },
    setIsCameraMirrored: (state, action: PayloadAction<boolean>) => {
      localStorage.setItem("isCameraMirrored", action.payload.toString());
      state.isCameraMirrored = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      document.cookie = `theme=${action.payload}; max-age=1704085200; path=/`;
      state.theme = action.payload;
    },
    setFocus: (
      state,
      action: PayloadAction<"local" | "remote" | undefined>
    ) => {
      state.focus = action.payload;
    },
    resetState: (state) => {
      state.localStream?.getTracks().forEach((track) => track.stop());
      state.remoteStream?.getTracks().forEach((track) => track.stop());
      state.localStream = undefined;
      state.remoteStream = undefined;
      state.isScreenShareEnabled = false;
      state.isChatVisible = false;
      state.isVideoEnabled = true;
      state.isAudioEnabled = true;
      state.focus = undefined;
    },
  },
  extraReducers(builder) {
    builder.addCase(updateLocalStream.fulfilled, (state, action) => {
      if (!action.payload) return;
      state.localStream = action.payload;
    });
  },
});

export const {
  setLocalStream,
  setRemoteStream,
  stopLocalStream,
  stopRemoteStream,
  setIsVideoEnabled,
  setIsAudioEnabled,
  setIsChatVisible,
  setIsScreenShareEnabled,
  setIsPermissionsGranted,
  setDefaultAudioDeviceId,
  setDefaultVideoDeviceId,
  setIsCameraMirrored,
  setTheme,
  setFocus,
  resetState,
} = userSlice.actions;

export default userSlice.reducer;
