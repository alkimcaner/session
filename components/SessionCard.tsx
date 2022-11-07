import Link from "next/link";
import React from "react";
import { FiLogIn } from "react-icons/fi";

interface IProps {
  name: string;
  id: string;
}

export default function SessionCard({ name, id }: IProps) {
  return (
    <Link
      href={`/sessions/${id}`}
      className="relative w-48 h-48 bg-base-300 hover:scale-105 transition-transform rounded-xl text-neutral-content"
    >
      <h1 className="absolute top-2 w-full text-center">{name}</h1>
      <div className="h-full flex justify-center items-center text-2xl">
        <FiLogIn />
      </div>
    </Link>
  );
}
