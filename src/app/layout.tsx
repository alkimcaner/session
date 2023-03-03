import "./globals.css";
import AppProviders from "./AppProviders";

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
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
