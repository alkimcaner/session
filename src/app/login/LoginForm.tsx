"use client";

import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useSupabase } from "../SupabaseProvider";

interface ICredentials {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const alertTimeout = useRef<NodeJS.Timeout>();
  const errorTimeout = useRef<NodeJS.Timeout>();
  const [isError, setIsError] = useState(false);
  const [credentials, setCredentials] = useState<ICredentials>({
    email: "",
    password: "",
  });

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSignUp) {
      await supabase.auth.signUp(credentials);
      //Clear timeouts
      clearTimeout(errorTimeout.current);
      clearTimeout(alertTimeout.current);

      //Show confirmation alert
      setIsError(false);
      setIsAlertVisible(true);

      alertTimeout.current = setTimeout(() => {
        setIsAlertVisible(false);
      }, 5000);
    } else {
      const { error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        //Clear timeouts
        clearTimeout(errorTimeout.current);
        clearTimeout(alertTimeout.current);

        //Show error alert
        setIsError(true);
        setIsAlertVisible(true);

        errorTimeout.current = setTimeout(() => {
          setIsError(false);
        }, 6000);

        alertTimeout.current = setTimeout(() => {
          setIsAlertVisible(false);
        }, 5000);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <>
      <div
        className={`alert ${isError && "alert-error"} shadow-lg w-fit fixed ${
          isAlertVisible
            ? "bottom-8 opacity-100"
            : "bottom-0 opacity-0 invisible"
        } transition-all ease-in-out duration-500`}
      >
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info flex-shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            {isError
              ? "Incorrect email or password"
              : "Confirmation mail sent. Please check your inbox."}
          </span>
        </div>
      </div>

      <div className="tabs tabs-boxed">
        <button
          onClick={() => setIsSignUp(false)}
          className={`tab ${!isSignUp && "tab-active"} transition`}
        >
          Log In
        </button>
        <button
          onClick={() => setIsSignUp(true)}
          className={`tab ${isSignUp && "tab-active"} transition`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleOnSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full max-w-xs"
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full max-w-xs"
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, password: e.target.value }))
          }
          required
        />
        <input
          type="submit"
          value={isSignUp ? "Sign Up" : "Log In"}
          className="btn btn-primary mt-4"
        />
      </form>
    </>
  );
}
