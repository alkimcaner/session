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

interface RemotePeer {
  id: string;
  stream: MediaStream | undefined;
  name: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isCameraMirrored: boolean;
}

export interface UserState {
  id: string | undefined;
  name: string;
  localStream: MediaStream | undefined;
  remotePeers: RemotePeer[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenShareEnabled: boolean;
  isChatVisible: boolean;
  isPermissionsGranted: boolean;
  defaultAudioDeviceId: string;
  defaultVideoDeviceId: string;
  isCameraMirrored: boolean;
  theme: string;
  focus: string | undefined;
}

const initialState: UserState = {
  id: undefined,
  name: name || "",
  localStream: undefined,
  remotePeers: [],
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
    setId: (state, action: PayloadAction<string | undefined>) => {
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
    addRemotePeer: (state, action: PayloadAction<RemotePeer>) => {
      const peerIndex = state.remotePeers.findIndex(
        (remotePeer) => remotePeer.id === action.payload.id
      );

      if (peerIndex !== -1) {
        if (!action.payload.stream) {
          state.remotePeers[peerIndex] = {
            ...action.payload,
            stream: state.remotePeers[peerIndex].stream,
          };
        } else {
          state.remotePeers[peerIndex] = action.payload;
        }
      } else {
        state.remotePeers.push(action.payload);
      }
    },
    removeRemotePeer: (state, action: PayloadAction<string>) => {
      state.remotePeers = state.remotePeers.filter(
        (remotePeer) => remotePeer.id !== action.payload
      );
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
    setFocus: (state, action: PayloadAction<string | undefined>) => {
      state.focus = action.payload;
    },
    resetState: (state) => {
      state.localStream?.getTracks().forEach((track) => track.stop());
      state.remotePeers.forEach((remotePeer) =>
        remotePeer.stream?.getTracks().forEach((track) => track.stop())
      );
      state.localStream = undefined;
      state.remotePeers = [];
      state.isScreenShareEnabled = false;
      state.isChatVisible = false;
      state.isVideoEnabled = true;
      state.isAudioEnabled = true;
      state.focus = undefined;
      state.id = undefined;
    },
  },
});

export const {
  setId,
  setName,
  setLocalStream,
  addRemotePeer,
  removeRemotePeer,
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
