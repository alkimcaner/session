import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { FiEdit } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setName } from "../slices/userSlice";

export default function Navbar() {
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [isNameEditable, setIsNameEditable] = useState(false);

  return (
    <nav className="w-full flex justify-center bg-base-100">
      <div className="relative max-w-7xl flex-1 flex justify-between items-center gap-4 p-4">
        <Link
          href="/"
          className="text-2xl font-extrabold text-secondary hover:text-secondary-focus transition-colors"
        >
          SESSION
        </Link>
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter name"
              value={userState.name}
              onChange={(e) => dispatch(setName(e.target.value))}
              className="input input-primary w-full max-w-[8rem] text-center disabled:cursor-default"
              disabled={!isNameEditable}
              required
            />
            <button
              onClick={() => setIsNameEditable((prev) => !prev)}
              className="btn text-lg"
            >
              {isNameEditable ? <TiTick /> : <FiEdit />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
