import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { FiEdit, FiSettings } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import { FormEvent, useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setName } from "../slices/userSlice";

export default function Navbar() {
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [isNameEditable, setIsNameEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [audioDevices, setAudioDevices] = useState<InputDeviceInfo[]>();
  const [videoDevices, setVideoDevices] = useState<InputDeviceInfo[]>();

  const handleSetName = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isNameEditable) {
      dispatch(setName(inputRef.current?.value || ""));
    }
    setIsNameEditable((prev) => !prev);
  };

  useEffect(() => {
    if (isNameEditable) {
      inputRef.current?.focus();
    }
  }, [isNameEditable]);

  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();

      setVideoDevices(devices.filter((device) => device.kind === "videoinput"));
      setAudioDevices(devices.filter((device) => device.kind === "audioinput"));
    };

    getDevices();
  }, []);

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
              <select className="select select-bordered select-sm w-full max-w-[16rem]">
                <option>Dark</option>
                <option>Light</option>
              </select>
            </div>
            <div className="flex justify-between items-center py-4">
              <span>Default Microphone</span>
              <select className="select select-bordered select-sm w-full max-w-[16rem]">
                {audioDevices?.map((device, index) => (
                  <option key={index}>{device.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center py-4">
              <span>Default Camera</span>
              <select className="select select-bordered select-sm w-full max-w-[16rem]">
                {videoDevices?.map((device, index) => (
                  <option key={index}>{device.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center py-4">
              <span>Mirror camera</span>
              <input type="checkbox" className="toggle toggle-primary" />
            </div>
          </label>
        </label>
      </div>
    </nav>
  );
}
