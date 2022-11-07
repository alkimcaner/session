import Head from "next/head";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { BsCameraVideo, BsVolumeUp, BsClipboard } from "react-icons/bs";
import { IoCallOutline } from "react-icons/io5";
import { useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";

export default function Home() {
  const user = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Session</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto flex flex-col lg:flex-row justify-center items-center gap-16 p-4">
        <div className="flex flex-col gap-8 justify-center">
          <h1 className="text-6xl text-secondary font-bold">
            Peer-to-peer live video and chat sessions
          </h1>
          <p className="text-xl text-neutral-content">
            Got tired of subscriptions? Chat with your friends without thinking
            about montly plans. Session is free of charge. Until we go bankrupt.
          </p>
          <div className="flex items-center gap-2 w-fit">
            <Link
              href={user ? "/sessions" : "/signin"}
              className="btn btn-primary"
            >
              Get started
            </Link>
            <span className="text-primary text-xs">For free!</span>
          </div>
        </div>
        <div className="mockup-window border border-neutral w-full h-full select-none bg-base-300">
          <div className="flex flex-col gap-16 justify-center items-center p-4 bg-base-200">
            <div className="w-full flex flex-col sm:flex-row gap-4">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <Image src="/assets/dog.jpg" alt="" fill />
                <div className="absolute bottom-0 left-0 px-2 py-1 text-xs bg-base-100 bg-opacity-70 rounded-tr-xl">
                  good_boi_13
                </div>
              </div>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <Image src="/assets/cat.jpg" alt="" fill />
                <div className="absolute bottom-0 left-0 px-2 py-1 text-xs bg-base-100 bg-opacity-70 rounded-tr-xl">
                  cutie_37
                </div>
              </div>
            </div>
            <div className="bg-base-100 border border-neutral p-2 rounded-xl flex gap-2 text-xl">
              <div className="p-2 rounded-full">
                <BsClipboard />
              </div>
              <div className="p-2 rounded-full">
                <BsCameraVideo />
              </div>
              <div className="p-2 rounded-full">
                <BsVolumeUp />
              </div>
              <div className="p-2 rounded-full border border-primary text-primary">
                <IoCallOutline />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
