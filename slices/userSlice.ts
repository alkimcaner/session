import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  adjectives,
  animals,
  colors,
  Config,
  uniqueNamesGenerator,
} from "unique-names-generator";

const nameGenConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: " ",
  length: 2,
  style: "capital",
};

export interface UserState {
  name: string;
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
}

const initialState: UserState = {
  name: "",
  localStream: undefined,
  remoteStream: undefined,
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenShareEnabled: false,
  isChatVisible: false,
  isPermissionsGranted: false,
  defaultAudioDeviceId: "default",
  defaultVideoDeviceId: "",
  isCameraMirrored: false,
  theme: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      let name = action.payload;
      if (!action.payload.length) {
        name = uniqueNamesGenerator(nameGenConfig);
      }
      localStorage.setItem("username", name);
      state.name = name;
    },
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
    toggleVideo: (state) => {
      if (!state.localStream || !state.localStream.getVideoTracks()[0]) return;
      state.localStream.getVideoTracks()[0].enabled = !state.isVideoEnabled;
      state.isVideoEnabled = !state.isVideoEnabled;
    },
    toggleAudio: (state) => {
      if (!state.localStream || !state.localStream.getAudioTracks()[0]) return;
      state.localStream.getAudioTracks()[0].enabled = !state.isAudioEnabled;
      state.isAudioEnabled = !state.isAudioEnabled;
    },
    toggleChat: (state) => {
      state.isChatVisible = !state.isChatVisible;
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
      localStorage.setItem("theme", action.payload);
      state.theme = action.payload;
    },
  },
});

export const {
  setName,
  setLocalStream,
  setRemoteStream,
  stopLocalStream,
  stopRemoteStream,
  toggleVideo,
  toggleAudio,
  toggleChat,
  setIsScreenShareEnabled,
  setIsPermissionsGranted,
  setDefaultAudioDeviceId,
  setDefaultVideoDeviceId,
  setIsCameraMirrored,
  setTheme,
} = userSlice.actions;

export default userSlice.reducer;
