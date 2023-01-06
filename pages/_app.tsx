import "../styles/globals.css";
import type { AppProps } from "next/app";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { setName } from "../slices/userSlice";

export default function App({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  useEffect(() => {
    const username = localStorage.getItem("username");
    store.dispatch(setName(username || ""));
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
