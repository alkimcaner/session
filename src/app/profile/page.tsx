import Image from "next/image";
import React from "react";

export default function Profile() {
  return (
    <div className="w-full h-screen flex flex-col gap-8 justify-center items-center">
      <div className="avatar online">
        <div className="w-32">
          <Image
            src="/cat.jpg"
            fill
            alt=""
            className="object-cover rounded-full overflow-hidden"
          />
        </div>
      </div>
      <span className="text-xl">John Doe</span>
    </div>
  );
}
