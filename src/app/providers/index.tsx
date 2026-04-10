"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { AuthInit } from "./auth-init";
import { Toaster } from "@/shared/ui";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthInit>{children}</AuthInit>
        <Toaster position="top-center" richColors />
      </QueryProvider>
    </ThemeProvider>
  );
}
