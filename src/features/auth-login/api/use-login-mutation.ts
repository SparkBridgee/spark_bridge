"use client";

import { useMutation } from "@tanstack/react-query";
import { signInWithEmail } from "@/entities/session/api/session-api";
import { useAuthStore } from "@/entities/session/model/auth-store";

export function useLoginMutation() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (vars: { email: string; password: string }) =>
      signInWithEmail(vars.email, vars.password),
    onSuccess: (data) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? "" });
      }
    },
  });
}
