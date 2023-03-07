"use client";

import { useAppDispatch } from "@/hooks";
import { setUser } from "@/slices/userSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSupabase } from "./SupabaseProvider";

export default function SupabaseListener({
  serverAccessToken,
}: {
  serverAccessToken?: string;
}) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await supabase.auth.getUser();
      if (user.error) {
        return;
      }
      dispatch(setUser(user.data.user));
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        dispatch(setUser(session.user));
      } else {
        dispatch(setUser(null));
      }

      if (session?.access_token !== serverAccessToken) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, router, supabase]);

  return null;
}
