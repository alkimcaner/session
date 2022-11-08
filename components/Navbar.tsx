import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-center bg-base-100">
      <div className="max-w-7xl flex-1 flex justify-center items-center gap-4 p-4">
        <Link
          href="/"
          className="text-2xl font-extrabold text-secondary hover:text-secondary-focus"
        >
          SESSION
        </Link>
      </div>
    </nav>
  );
}
