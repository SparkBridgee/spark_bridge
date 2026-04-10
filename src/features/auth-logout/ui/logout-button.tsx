"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui";
import { signOut } from "@/entities/session/api/session-api";
import { useAuthStore } from "@/entities/session/model/auth-store";

export function LogoutButton() {
  const router = useRouter();
  const qc = useQueryClient();
  const clear = useAuthStore((s) => s.clear);

  async function onClick() {
    try {
      await signOut();
    } catch {
      // ignore
    }
    clear();
    qc.clear();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      로그아웃
    </Button>
  );
}
