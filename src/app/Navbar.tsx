"use client";

import Link from "next/link";
import { FiEdit, FiSettings } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import { FormEvent, useRef, useState, useEffect } from "react";
import {
  setDefaultAudioDeviceId,
  setDefaultVideoDeviceId,
  setIsCameraMirrored,
  setIsPermissionsGranted,
  setName,
  setTheme,
} from "../slices/userSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

export default function Navbar() {
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

  // Focus username input
  useEffect(() => {
    if (isNameEditable) {
      inputRef.current?.focus();
    }
  }, [isNameEditable]);

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

  //Change theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", userState.theme);
  }, [userState.theme]);

  return (
    <nav className="w-full flex justify-center bg-base-100">
      <div className="relative max-w-7xl flex-1 flex justify-between items-center gap-4 p-4">
        <Link
          href="/"
          className="text-2xl font-extrabold text-secondary hover:text-secondary-focus transition-colors"
        >
          SESSION
        </Link>

        <label htmlFor="my-modal-4" className="btn gap-4">
          {userState.name} <FiSettings />
        </label>

        <input type="checkbox" id="my-modal-4" className="modal-toggle" />
        <label htmlFor="my-modal-4" className="modal cursor-pointer">
          <label className="modal-box relative" htmlFor="">
            <h3 className="text-lg font-bold pb-4">Settings</h3>
            <div className="flex justify-between items-center py-4">
              <span>Username</span>
              <form onSubmit={handleSetName} className="form-control">
                <div className="input-group input-group-sm">
                  {isNameEditable ? (
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Enter name"
                      className="input input-primary input-sm w-full max-w-[16rem]"
                    />
                  ) : (
                    <span className="">{userState.name}</span>
                  )}

                  <button type="submit" className="btn btn-sm">
                    {isNameEditable ? <TiTick /> : <FiEdit />}
                  </button>
                </div>
              </form>
            </div>
            <div className="flex justify-between items-center py-4">
              <span>Theme</span>
              <select
                value={userState.theme}
                onChange={(ev) => dispatch(setTheme(ev.target.value))}
                className="select select-bordered select-sm w-full max-w-[12rem]"
              >
                <option disabled value="">
                  Pick a theme
                </option>
                <option value="">Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="cupcake">Cupcake</option>
                <option value="bumblebee">Bumblebee</option>
                <option value="emerald">Emerald</option>
                <option value="corporate">Corporate</option>
                <option value="synthwave">Synthwave</option>
                <option value="retro">Retro</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="valentine">Valentine</option>
                <option value="halloween">Halloween</option>
                <option value="garden">Garden</option>
                <option value="forest">Forest</option>
                <option value="aqua">Aqua</option>
                <option value="lofi">Lofi</option>
                <option value="pastel">Pastel</option>
                <option value="fantasy">Fantasy</option>
                <option value="wireframe">Wireframe</option>
                <option value="black">Black</option>
                <option value="luxury">Luxury</option>
                <option value="dracula">Dracula</option>
                <option value="cmyk">Cmyk</option>
                <option value="autumn">Autumn</option>
                <option value="business">Business</option>
                <option value="acid">Acid</option>
                <option value="lemonade">Lemonade</option>
                <option value="night">Night</option>
                <option value="coffee">Coffee</option>
                <option value="winter">Winter</option>
              </select>
            </div>
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
    </nav>
  );
}
