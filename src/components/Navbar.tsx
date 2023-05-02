import { useAppDispatch, useAppSelector } from "../hooks/typedReduxHooks";
import { setTheme } from "../slices/userSlice";
import { useEffect } from "react";
import { BsPalette2 } from "react-icons/bs";
import { MdKeyboardArrowDown } from "react-icons/md";
import Settings from "./Settings";
import { Link } from "react-router-dom";

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

  //Change theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", userState.theme);
  }, [userState.theme]);

  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-center gap-4 p-4">
      <Link
        to="/"
        className="mr-auto text-2xl font-extrabold text-primary transition-colors hover:text-secondary-focus"
      >
        SESSION
      </Link>
      {/* Theme Menu */}
      <div className="dropdown-end dropdown">
        <label tabIndex={0} className="btn-ghost btn gap-2">
          <BsPalette2 />
          <span className="hidden sm:inline">Theme</span>
          <MdKeyboardArrowDown />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content rounded-box grid h-64 w-48 grid-cols-1 bg-base-200 p-2 pr-4 shadow-xl scrollbar-thin scrollbar-thumb-primary scrollbar-thumb-rounded"
        >
          {themes.map((theme, index) => (
            <li key={index}>
              <button
                className={`btn ${
                  userState.theme === theme ? "btn-primary" : "btn-ghost"
                } w-full justify-start`}
                onClick={() => dispatch(setTheme(theme))}
              >
                {theme}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Settings />
    </nav>
  );
}
