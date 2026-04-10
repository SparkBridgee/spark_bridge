"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Label, toast } from "@/shared/ui";
import { useLoginMutation } from "@/features/auth-login/api/use-login-mutation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/search";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useLoginMutation();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ email, password });
      toast.success("로그인 성공");
      router.push(next);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "로그인 실패";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" loading={mutation.isPending} size="lg" className="w-full">
        로그인
      </Button>
    </form>
  );
}
