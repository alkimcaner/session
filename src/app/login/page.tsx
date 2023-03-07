import { createClient } from "@/utils/supabase-server";
import { redirect } from "next/navigation";
import React from "react";
import LoginForm from "./LoginForm";

export const revalidate = 0;

export default async function Profile() {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  if (user.data.user) {
    redirect("/");
  }

  return (
    <div className="w-full h-screen flex flex-col gap-4 justify-center items-center">
      <LoginForm />
    </div>
  );
}
