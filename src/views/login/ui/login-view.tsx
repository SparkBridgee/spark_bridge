"use client";

import Link from "next/link";
import { Suspense } from "react";
import { motion } from "motion/react";
import { LoginForm } from "@/features/auth-login/ui/login-form";

export function LoginView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12 sm:px-6"
    >
      <div className="mb-8 flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold">Spark Bridge</h1>
        <p className="text-sm text-muted-foreground">로그인하여 시작하세요</p>
      </div>
      <Suspense fallback={<div className="h-40" />}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline underline-offset-4"
        >
          회원가입
        </Link>
      </p>
    </motion.div>
  );
}
