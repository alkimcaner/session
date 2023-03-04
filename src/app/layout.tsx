import "./globals.css";
import AppProviders from "./AppProviders";
import Navbar from "./Navbar";

export const metadata = {
  title: "Session",
  description: "High quality video calls for free",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AppProviders>
        <body className="h-screen flex flex-col">
          <Navbar />
          {children}
        </body>
      </AppProviders>
    </html>
  );
}
