import type { Platform } from "@/entities/video/model/types";

export interface Account {
  platform: Platform;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  videoCount?: number;
}
