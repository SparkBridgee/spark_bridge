"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { SignupForm } from "@/features/auth-signup/ui/signup-form";

export function SignupView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12 sm:px-6"
    >
      <div className="mb-8 flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold">Spark Bridge</h1>
        <p className="text-sm text-muted-foreground">새 계정을 만드세요</p>
      </div>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          로그인
        </Link>
      </p>
    </motion.div>
  );
}
