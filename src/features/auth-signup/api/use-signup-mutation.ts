"use client";

import { useMutation } from "@tanstack/react-query";
import { signUpWithEmail } from "@/entities/session/api/session-api";
import { useAuthStore } from "@/entities/session/model/auth-store";

export function useSignupMutation() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (vars: { email: string; password: string }) => {
      const data = await signUpWithEmail(vars.email, vars.password);
      return data;
    },
    onSuccess: (data) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? "" });
      }
    },
  });
}
