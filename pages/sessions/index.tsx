import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent } from "react";
import { v4 } from "uuid";
import Navbar from "../../components/Navbar";
import SessionCard from "../../components/SessionCard";
import { AiOutlinePlus } from "react-icons/ai";

export default function Home() {
  const router = useRouter();

  const handleCreateSession = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/session/${v4()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Session</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col gap-16 p-4 pt-16">
        <h1 className="text-3xl text-neutral-content">MY SESSIONS</h1>
        <div className="flex gap-8 flex-wrap">
          {/* Create session */}
          <button className="w-48 h-48 border-2 border-dashed border-neutral hover:scale-105 transition-transform rounded-xl">
            <div className="flex justify-center items-center gap-1 text-base text-center text-neutral-content">
              <AiOutlinePlus />
              Create a session
            </div>
          </button>
          <SessionCard name="My super session" id="a8s76da-asda-lk12j3" />
        </div>
      </main>
    </div>
  );
}
