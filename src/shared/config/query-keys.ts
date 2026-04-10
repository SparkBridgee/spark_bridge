import type { Platform } from "@/entities/video/model/types";

export const queryKeys = {
  accountVideos: (platform: Platform, username: string) =>
    ["account-videos", platform, username] as const,
  savedSelections: () => ["saved-selections"] as const,
  savedSelection: (id: string) => ["saved-selection", id] as const,
} as const;
