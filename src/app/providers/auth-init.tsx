"use client";

import { useEffect, type ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/client";
import { useAuthStore } from "@/entities/session/model/auth-store";

export function AuthInit({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? "" });
      } else {
        setUser(null);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" });
      } else {
        setUser(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
}
