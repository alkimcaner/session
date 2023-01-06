import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { FiEdit } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import { FormEvent, useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setName } from "../slices/userSlice";

export default function Navbar() {
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [isNameEditable, setIsNameEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
          <form onSubmit={handleSetName} className="input-group">
            {isNameEditable ? (
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter name"
                className="input input-primary w-full max-w-[8rem] text-center disabled:cursor-default"
                disabled={!isNameEditable}
              />
            ) : (
              <span className="px-8">{userState.name}</span>
            )}

            <button type="submit" className="btn text-lg">
              {isNameEditable ? <TiTick /> : <FiEdit />}
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
