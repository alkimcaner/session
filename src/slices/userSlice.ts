import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  colors,
  animals,
  Config,
  uniqueNamesGenerator,
} from "unique-names-generator";

const nameGenConfig: Config = {
  dictionaries: [colors, animals],
  separator: " ",
  length: 2,
  style: "capital",
};

//Get localstorage
const name = localStorage.getItem("username");
const theme = localStorage.getItem("theme");
const defaultAudioDeviceId = localStorage.getItem("defaultAudioDeviceId");
const defaultVideoDeviceId = localStorage.getItem("defaultVideoDeviceId");
const isCameraMirrored = localStorage.getItem("isCameraMirrored") === "true";

interface RemoteStream {
  id: string;
  stream: MediaStream;
}

export interface UserState {
  id: string;
  name: string;
  localStream: MediaStream | undefined;
  remoteStreams: RemoteStream[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenShareEnabled: boolean;
  isChatVisible: boolean;
  isPermissionsGranted: boolean;
  defaultAudioDeviceId: string;
  defaultVideoDeviceId: string;
  isCameraMirrored: boolean;
  theme: string;
  focus: string;
}

const initialState: UserState = {
  id: "",
  name: name || "",
  localStream: undefined,
  remoteStreams: [],
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenShareEnabled: false,
  isChatVisible: false,
  isPermissionsGranted: false,
  defaultAudioDeviceId: defaultAudioDeviceId || "default",
  defaultVideoDeviceId: defaultVideoDeviceId || "",
  isCameraMirrored: isCameraMirrored || false,
  theme: theme || "",
  focus: "",
};

// export const updateLocalStream = createAsyncThunk<
//   MediaStream | undefined,
//   { screen: boolean },
//   { dispatch: AppDispatch; state: RootState }
// >("user/updateLocalStream", async ({ screen }, { dispatch, getState }) => {
//   try {
//     let stream: MediaStream;

//     if (screen) {
//       stream = await navigator.mediaDevices.getDisplayMedia({
//         video: true,
//         audio: true,
//       });

//       dispatch(setIsCameraMirrored(false));
//     } else {
//       stream = await navigator.mediaDevices.getUserMedia({
//         video: { deviceId: { ideal: getState().user.defaultVideoDeviceId } },
//         audio: { deviceId: { ideal: getState().user.defaultAudioDeviceId } },
//       });

//       dispatch(setIsScreenShareEnabled(false));
//     }

//     const videoTrack = stream.getVideoTracks()[0];
//     const audioTrack = stream.getAudioTracks()[0];

//     //Stop screen share if mediastream ends
//     videoTrack.onended = () => dispatch(setIsScreenShareEnabled(false));

//     return stream;
//   } catch (err) {
//     dispatch(setIsScreenShareEnabled(false));
//     console.error(err);
//   }
// });

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      let name = action.payload;
      if (!action.payload.length) {
        name = uniqueNamesGenerator(nameGenConfig);
      }
      localStorage.setItem("username", name);
      state.name = name;
    },
    setLocalStream: (state, action: PayloadAction<MediaStream | undefined>) => {
      state.localStream?.getTracks().forEach((track) => track.stop());
      state.localStream = action.payload;
    },
    addRemoteStream: (state, action: PayloadAction<RemoteStream>) => {
      const streamIndex = state.remoteStreams.findIndex(
        (remoteStream) => remoteStream.id === action.payload.id
      );
      console.log("add stream");
      if (streamIndex) {
        state.remoteStreams[streamIndex] = action.payload;
        return;
      }
      state.remoteStreams.push(action.payload);
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
      localStorage.setItem("theme", action.payload);
      state.theme = action.payload;
    },
    setFocus: (state, action: PayloadAction<string>) => {
      state.focus = action.payload;
    },
    resetState: (state) => {
      state.localStream?.getTracks().forEach((track) => track.stop());
      state.remoteStreams.forEach((remoteStream) =>
        remoteStream.stream.getTracks().forEach((track) => track.stop())
      );
      state.localStream = undefined;
      state.remoteStreams = [];
      state.isScreenShareEnabled = false;
      state.isChatVisible = false;
      state.isVideoEnabled = true;
      state.isAudioEnabled = true;
      state.focus = "";
    },
  },
});

export const {
  setId,
  setName,
  setLocalStream,
  addRemoteStream,
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
