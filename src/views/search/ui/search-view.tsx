"use client";

import { motion } from "motion/react";
import { SearchForm } from "@/features/account-search/ui/search-form";

export function SearchView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10 sm:py-14"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          계정 검색
        </h1>
        <p className="text-sm text-muted-foreground">
          TikTok 또는 Instagram 계정의 username을 입력하여 최근 영상을 확인하세요.
        </p>
      </div>
      <SearchForm />
    </motion.div>
  );
}
