import Link from "next/link";

export const metadata = {
  title: "Session Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex">
        <nav className="h-screen py-4 px-8 bg-base-300 flex flex-col">
          <Link
            href="/"
            className="text-2xl font-extrabold text-secondary hover:text-secondary-focus transition-colors"
          >
            SESSION
          </Link>
          <Link href="/dashboard/settings">Settings</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
