"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";
import type { Platform } from "@/entities/video/model/types";

export interface AccountCheckResponse {
  exists: boolean;
  unknown?: boolean;
  platform: Platform;
  username: string;
}

export function useAccountCheckQuery(platform: Platform, username: string) {
  return useQuery({
    queryKey: ["account-check", platform, username],
    queryFn: async () => {
      const res = await api.post<AccountCheckResponse>("/account-check", {
        platform,
        username,
      });
      return res.data;
    },
    enabled: Boolean(username),
    staleTime: 15 * 60_000,
    retry: 0,
  });
}
