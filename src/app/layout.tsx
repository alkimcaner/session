import "server-only";

import "./globals.css";
import ReduxProvider from "./ReduxProvider";
import Navbar from "./Navbar";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase-server";
import SupabaseProvider from "./SupabaseProvider";
import SupabaseListener from "./SupabaseListener";

export const metadata = {
  title: "Session",
  description: "High quality video calls for free",
};

export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" data-theme={theme?.value}>
      <body className="h-screen flex flex-col">
        <ReduxProvider>
          <SupabaseProvider>
            <SupabaseListener serverAccessToken={session?.access_token} />
            <Navbar />
            {children}
          </SupabaseProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
