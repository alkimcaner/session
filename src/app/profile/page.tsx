import { createClient } from "@/utils/supabase-server";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

export const revalidate = 0;

export default async function Profile() {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  if (user.error) {
    redirect("/");
  }

  return (
    <div className="w-full h-screen flex flex-col gap-4 justify-center items-center">
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
      <span className="text-xl">{user.data.user?.email}</span>
      <span>
        Joined on {new Date(user.data.user?.created_at!).toDateString()}
      </span>
    </div>
  );
}
