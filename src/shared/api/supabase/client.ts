"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/shared/config/env";

export function createSupabaseBrowserClient() {
  return createBrowserClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY);
}
