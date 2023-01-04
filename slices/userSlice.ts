import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  name: string;
  localStream: MediaStream | undefined;
  remoteStream: MediaStream | undefined;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenEnabled: boolean;
  isChatVisible: boolean;
}

const initialState: UserState = {
  name: "",
  localStream: undefined,
  remoteStream: undefined,
  isAudioEnabled: true,
  isVideoEnabled: true,
  isScreenEnabled: false,
  isChatVisible: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      localStorage.setItem("username", action.payload);
      state.name = action.payload;
    },
    setLocalStream: (state, action: PayloadAction<MediaStream>) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action: PayloadAction<MediaStream>) => {
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
    setIsScreenEnabled: (state, action: PayloadAction<boolean>) => {
      state.isScreenEnabled = action.payload;
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
  setIsScreenEnabled,
} = userSlice.actions;

export default userSlice.reducer;
