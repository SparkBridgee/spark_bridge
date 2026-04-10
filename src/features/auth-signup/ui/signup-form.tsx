"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, toast } from "@/shared/ui";
import { useSignupMutation } from "@/features/auth-signup/api/use-signup-mutation";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useSignupMutation();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const data = await mutation.mutateAsync({ email, password });
      if (data.session) {
        toast.success("회원가입 성공!");
        router.push("/search");
        router.refresh();
      } else {
        toast.info("확인 이메일을 확인해 주세요.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "회원가입 실패";
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="최소 6자"
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" loading={mutation.isPending} size="lg" className="w-full">
        회원가입
      </Button>
    </form>
  );
}
