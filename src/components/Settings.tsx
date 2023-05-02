import { useState, useEffect, FormEvent, useRef } from "react";
import { FiEdit, FiSettings } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import {
  setDefaultAudioDeviceId,
  setDefaultVideoDeviceId,
  setIsCameraMirrored,
  setIsPermissionsGranted,
  setName,
} from "../slices/userSlice";
import { useAppDispatch, useAppSelector } from "../hooks/typedReduxHooks";

export default function SettingsModal() {
  const userState = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isNameEditable, setIsNameEditable] = useState(false);
  const [audioDevices, setAudioDevices] = useState<InputDeviceInfo[]>();
  const [videoDevices, setVideoDevices] = useState<InputDeviceInfo[]>();

  const handleSetName = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isNameEditable) {
      dispatch(setName(inputRef.current?.value || ""));
    }
    setIsNameEditable((prev) => !prev);
  };

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
    const handleOnPermissionChange = (e: Event) => {
      const target = e.target as PermissionStatus;
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
      <label htmlFor="my-modal-4" className="btn-primary btn gap-2">
        <FiSettings />
        <span className="hidden sm:inline">Settings</span>
      </label>
      <input type="checkbox" id="my-modal-4" className="modal-toggle" />
      <label htmlFor="my-modal-4" className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h3 className="pb-4 text-lg font-bold">Settings</h3>
          <div className="flex items-center justify-between py-4">
            <span>Username</span>
            <form onSubmit={handleSetName} className="form-control">
              <div className="input-group-sm input-group">
                {isNameEditable ? (
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter name"
                    className="input-primary input input-sm w-full max-w-[12rem]"
                  />
                ) : (
                  <span>{userState.name}</span>
                )}

                <button type="submit" className="btn-sm btn">
                  {isNameEditable ? <TiTick /> : <FiEdit />}
                </button>
              </div>
            </form>
          </div>
          <div className="flex items-center justify-between py-4">
            <span>Default Microphone</span>
            {userState.isPermissionsGranted ? (
              <select
                value={userState.defaultAudioDeviceId}
                onChange={(e) =>
                  dispatch(setDefaultAudioDeviceId(e.target.value))
                }
                className="select-bordered select select-sm w-full max-w-[12rem]"
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
                className="btn-warning btn-sm btn"
              >
                Permissions required
              </button>
            )}
          </div>
          <div className="flex items-center justify-between py-4">
            <span>Default Camera</span>
            {userState.isPermissionsGranted ? (
              <select
                value={userState.defaultVideoDeviceId}
                onChange={(e) =>
                  dispatch(setDefaultVideoDeviceId(e.target.value))
                }
                className="select-bordered select select-sm w-full max-w-[12rem]"
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
                className="btn-warning btn-sm btn"
              >
                Permissions required
              </button>
            )}
          </div>
          <div className="flex items-center justify-between py-4">
            <span>Mirror Camera</span>
            <input
              type="checkbox"
              className="toggle-primary toggle"
              checked={userState.isCameraMirrored}
              onChange={(e) => dispatch(setIsCameraMirrored(e.target.checked))}
            />
          </div>
        </label>
      </label>
    </div>
  );
}
