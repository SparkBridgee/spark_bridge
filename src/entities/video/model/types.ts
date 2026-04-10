export type Platform = "tiktok" | "instagram";

export interface NormalizedVideo {
  id: string;
  platform: Platform;
  videoUrl: string; // external share URL
  thumbnailUrl: string;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  postedAt: string; // ISO
  author: {
    username: string;
    avatarUrl?: string;
  };
}
