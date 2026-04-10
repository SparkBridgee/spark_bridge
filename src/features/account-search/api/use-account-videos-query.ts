"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";
import { queryKeys } from "@/shared/config/query-keys";
import type { NormalizedVideo, Platform } from "@/entities/video/model/types";

export interface AccountVideosResponse {
  videos: NormalizedVideo[];
  username: string;
  platform: Platform;
}

async function fetchAccountVideos(
  platform: Platform,
  username: string,
  limit: number
): Promise<AccountVideosResponse> {
  const res = await api.post<AccountVideosResponse>(`/apify/${platform}`, {
    username,
    limit,
  });
  return res.data;
}

export function useAccountVideosQuery(
  platform: Platform,
  username: string,
  limit = 50,
  enabled = true
) {
  return useQuery({
    queryKey: [...queryKeys.accountVideos(platform, username), limit],
    queryFn: () => fetchAccountVideos(platform, username, limit),
    enabled: Boolean(username) && enabled,
    staleTime: 5 * 60_000,
  });
}
