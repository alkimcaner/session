import Link from "next/link";
import React from "react";
import { CgProfile } from "react-icons/cg";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-center bg-base-100">
      <ul className="max-w-7xl flex-1 flex justify-center items-center gap-4 px-4 p-2">
        <li>
          <Link
            href="/"
            className="text-2xl font-extrabold text-secondary hover:text-secondary-focus"
          >
            SESSION
          </Link>
        </li>
        <li className="ml-auto">
          <Link href="/dashboard" className="btn btn-outline btn-secondary">
            Dashboard
          </Link>
        </li>
        <li className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-primary btn-square m-1 text-lg"
          >
            <CgProfile />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-lg bg-base-300 rounded-box w-52"
          >
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a>Sign out</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}
