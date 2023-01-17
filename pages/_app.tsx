import "../styles/globals.css";
import type { AppProps } from "next/app";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import {
  setDefaultAudioDeviceId,
  setDefaultVideoDeviceId,
  setIsCameraMirrored,
  setName,
  setTheme,
} from "../slices/userSlice";

export default function App({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  useEffect(() => {
    const username = localStorage.getItem("username");
    store.dispatch(setName(username || ""));

    const isCameraMirrored =
      localStorage.getItem("isCameraMirrored") === "true";
    store.dispatch(setIsCameraMirrored(isCameraMirrored));

    const defaultVideoDeviceId = localStorage.getItem("defaultVideoDeviceId");
    store.dispatch(setDefaultVideoDeviceId(defaultVideoDeviceId || ""));

    const defaultAudioDeviceId = localStorage.getItem("defaultAudioDeviceId");
    store.dispatch(setDefaultAudioDeviceId(defaultAudioDeviceId || "default"));

    const theme = localStorage.getItem("theme");
    store.dispatch(setTheme(theme || ""));
  }, []);

  return (
    <Provider store={store}>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
      </SessionContextProvider>
    </Provider>
  );
}
