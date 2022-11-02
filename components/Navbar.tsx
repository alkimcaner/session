import Link from "next/link";
import React from "react";
import { CgProfile } from "react-icons/cg";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full flex justify-center bg-base-100 z-50 border-b border-primary">
      <ul className="max-w-5xl flex-1 flex justify-center items-center gap-4 px-4 p-2">
        <li>
          <Link href="/" className="font-bold text-primary">
            SESSION
          </Link>
        </li>
        <li className="ml-auto link link-hover hover:link-primary">
          <Link href="/sessions">My sessions</Link>
        </li>
        <li className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost m-1 text-lg">
            <CgProfile />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-lg bg-base-300 rounded-box w-52"
          >
            <li>
              <a>Dashboard</a>
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
