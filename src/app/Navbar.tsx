"use client";

import { useAppDispatch, useAppSelector } from "@/hooks";
import { setTheme } from "@/slices/userSlice";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsPalette2, BsPersonFill, BsThreeDots } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { MdKeyboardArrowDown, MdLogout } from "react-icons/md";
import SettingsModal from "./SettingsModal";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];

export default function Navbar() {
  const userState = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [isClient, setIsClient] = useState(false);

  //Change theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", userState.theme);
  }, [userState.theme]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="w-full flex justify-center bg-base-100">
      <div className="relative max-w-7xl flex-1 flex items-center gap-4 p-4">
        <Link
          href="/"
          className="text-2xl font-extrabold text-primary hover:text-secondary-focus transition-colors mr-auto"
        >
          SESSION
        </Link>
        {/* Theme Menu */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost gap-2">
            <BsPalette2 /> Theme <MdKeyboardArrowDown />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content p-2 shadow-xl bg-base-200 rounded-box w-48 h-64 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary grid grid-cols-1"
          >
            {themes.map((theme, index) => (
              <button
                key={index}
                className={`btn ${
                  isClient && userState.theme === theme
                    ? "btn-primary"
                    : "btn-ghost"
                } justify-start`}
                onClick={() => dispatch(setTheme(theme))}
              >
                {theme}
              </button>
            ))}
          </ul>
        </div>
        {/* Profile menu */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-secondary gap-2">
            John Doe <BsThreeDots />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-xl bg-base-200 rounded-box w-52"
          >
            <li>
              <Link href="/profile">
                <BsPersonFill /> Profile
              </Link>
            </li>
            <li>
              <label htmlFor="my-modal-4">
                <FiSettings /> Settings
              </label>
            </li>
            <li>
              <a>
                <MdLogout /> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* Settings Modal */}
      <SettingsModal />
    </nav>
  );
}
