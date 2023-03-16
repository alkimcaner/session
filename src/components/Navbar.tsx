import { useAppDispatch, useAppSelector } from "../typedReduxHooks";
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
    <nav className="w-full flex justify-center bg-base-100">
      <div className="relative max-w-5xl flex-1 flex items-center gap-4 p-4">
        <Link
          to="/"
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
            className="dropdown-content p-2 pr-4 shadow-xl bg-base-200 rounded-box w-48 h-64 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary grid grid-cols-1"
          >
            {themes.map((theme, index) => (
              <li key={index}>
                <button
                  className={`btn ${
                    userState.theme === theme ? "btn-primary" : "btn-ghost"
                  } justify-start w-full`}
                  onClick={() => dispatch(setTheme(theme))}
                >
                  {theme}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Settings />
      </div>
    </nav>
  );
}
