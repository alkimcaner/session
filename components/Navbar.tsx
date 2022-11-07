import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React from "react";
import { CgProfile } from "react-icons/cg";

export default function Navbar() {
  const user = useUser();
  const supabase = useSupabaseClient();

  return (
    <nav className="w-full flex justify-center bg-base-100">
      <div className="max-w-7xl flex-1 flex justify-center items-center gap-4 p-4">
        <Link
          href="/"
          className="text-2xl font-extrabold text-secondary hover:text-secondary-focus"
        >
          SESSION
        </Link>

        {user ? (
          <>
            <Link
              href="/sessions"
              className="ml-auto btn btn-outline btn-secondary"
            >
              My Sessions
            </Link>

            <div className="dropdown dropdown-end">
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
                  <button onClick={() => supabase.auth.signOut()}>
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <Link href="/signin" className="ml-auto btn btn-secondary">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
