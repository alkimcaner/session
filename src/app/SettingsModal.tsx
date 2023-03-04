"use client";

import { useState, useEffect } from "react";
import {
  setDefaultAudioDeviceId,
  setDefaultVideoDeviceId,
  setIsCameraMirrored,
  setIsPermissionsGranted,
} from "../slices/userSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

export default function SettingsModal() {
  const userState = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [audioDevices, setAudioDevices] = useState<InputDeviceInfo[]>();
  const [videoDevices, setVideoDevices] = useState<InputDeviceInfo[]>();

  //Grant permission
  const handleGrantPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { ideal: userState.defaultVideoDeviceId } },
        audio: { deviceId: { ideal: userState.defaultAudioDeviceId } },
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Check permissions
  useEffect(() => {
    const handleOnPermissionChange = (ev: Event) => {
      const target = ev.target as PermissionStatus;
      if (target.state === "granted") {
        dispatch(setIsPermissionsGranted(true));
      } else {
        dispatch(setIsPermissionsGranted(false));
      }
    };

    const checkPermission = async () => {
      try {
        const permissionName = "microphone" as PermissionName;
        const permission = await navigator.permissions.query({
          name: permissionName,
        });
        // Initial permission check
        if (permission.state === "granted") {
          dispatch(setIsPermissionsGranted(true));
        }
        //On permission change event
        permission.onchange = handleOnPermissionChange;
      } catch (error) {
        console.error(error);
      }
    };

    checkPermission();
  }, []);

  // Enumerate devices if permissions are granted
  useEffect(() => {
    const getDevices = async () => {
      try {
        if (!userState.isPermissionsGranted) return;

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setAudioDevices(audioDevices);
        setVideoDevices(videoDevices);

        //Set default state if empty
        if (!userState.defaultVideoDeviceId) {
          dispatch(setDefaultVideoDeviceId(videoDevices[0].deviceId));
        }
      } catch (error) {
        console.error(error);
      }
    };

    getDevices();
  }, [userState.isPermissionsGranted]);

  return (
    <div>
      <input type="checkbox" id="my-modal-4" className="modal-toggle" />
      <label htmlFor="my-modal-4" className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h3 className="text-lg font-bold pb-4">Settings</h3>
          <div className="flex justify-between items-center py-4">
            <span>Default Microphone</span>
            {userState.isPermissionsGranted ? (
              <select
                value={userState.defaultAudioDeviceId}
                onChange={(ev) =>
                  dispatch(setDefaultAudioDeviceId(ev.target.value))
                }
                className="select select-bordered select-sm w-full max-w-[12rem]"
              >
                <option disabled value="">
                  Pick a microphone
                </option>
                {audioDevices?.map((device, index) => (
                  <option key={index} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={handleGrantPermission}
                className="btn btn-sm btn-warning"
              >
                Permissions required
              </button>
            )}
          </div>
          <div className="flex justify-between items-center py-4">
            <span>Default Camera</span>
            {userState.isPermissionsGranted ? (
              <select
                value={userState.defaultVideoDeviceId}
                onChange={(ev) =>
                  dispatch(setDefaultVideoDeviceId(ev.target.value))
                }
                className="select select-bordered select-sm w-full max-w-[12rem]"
              >
                <option disabled value="">
                  Pick a camera
                </option>
                {videoDevices?.map((device, index) => (
                  <option key={index} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={handleGrantPermission}
                className="btn btn-sm btn-warning"
              >
                Permissions required
              </button>
            )}
          </div>
          <div className="flex justify-between items-center py-4">
            <span>Mirror Camera</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={userState.isCameraMirrored}
              onChange={(ev) =>
                dispatch(setIsCameraMirrored(ev.target.checked))
              }
            />
          </div>
        </label>
      </label>
    </div>
  );
}
