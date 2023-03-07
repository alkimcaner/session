import { createClient } from "@/utils/supabase-server";
import Link from "next/link";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  return (
    <main className="flex-1 max-w-7xl mx-auto flex flex-col lg:flex-row justify-center items-center gap-16 p-4">
      <div className="flex flex-col gap-8 justify-center">
        <h1 className="text-6xl text-primary font-bold">
          High quality video calls for ✨
          <span className="text-yellow-400">free</span>✨
        </h1>
        <p className="text-xl text-base-content">
          Got tired of subscriptions? Call your friends without thinking about
          montly plans. Session is free of charge.
        </p>
        <div className="flex items-center gap-2 w-fit">
          <Link
            href={user.error ? "/login" : "/profile"}
            className="btn btn-primary"
          >
            Get Started
          </Link>
          <span className="text-base-content text-xs">For free!</span>
        </div>
      </div>
    </main>
  );
}
