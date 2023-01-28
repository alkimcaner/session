import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
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
    console.error(err);
  }
});

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
  extraReducers(builder) {
    builder.addCase(updateLocalStream.fulfilled, (state, action) => {
      if (!action.payload) return;
      state.localStream = action.payload;
    });
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
