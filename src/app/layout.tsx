import "./globals.css";
import AppProviders from "./AppProviders";
import Navbar from "./Navbar";
import { cookies } from "next/headers";

export const metadata = {
  title: "Session",
  description: "High quality video calls for free",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");

  return (
    <html lang="en" data-theme={theme?.value}>
      <AppProviders>
        <body className="h-screen flex flex-col">
          <Navbar />
          {children}
        </body>
      </AppProviders>
    </html>
  );
}
