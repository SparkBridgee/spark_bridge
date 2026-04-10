import type { NormalizedVideo } from "@/entities/video/model/types";

type AnyObj = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

// TikTok: clockworks~tiktok-scraper
export function normalizeTikTokVideo(raw: AnyObj): NormalizedVideo {
  const videoId = str(raw.id) || str(raw.aweme_id);
  const authorMeta = (raw.authorMeta || raw.author || {}) as AnyObj;
  const videoMeta = (raw.videoMeta || {}) as AnyObj;

  const username =
    str(authorMeta.name) ||
    str(authorMeta.uniqueId) ||
    str(authorMeta.unique_id);

  const thumbnailUrl =
    str(videoMeta.coverUrl) ||
    str(raw.cover) ||
    str(raw.origin_cover) ||
    str(raw.dynamic_cover);

  const externalUrl =
    str(raw.webVideoUrl) ||
    (videoId && username
      ? `https://www.tiktok.com/@${username}/video/${videoId}`
      : "");

  const createTimeISO = str(raw.createTimeISO);
  const createTime = num(raw.createTime);
  const postedAt = createTimeISO
    ? createTimeISO
    : createTime
      ? new Date(createTime * 1000).toISOString()
      : new Date(0).toISOString();

  return {
    id: `tiktok-${videoId}`,
    platform: "tiktok",
    videoUrl: externalUrl,
    thumbnailUrl,
    caption: str(raw.text) || str(raw.title) || str(raw.desc),
    views: num(raw.playCount ?? raw.play_count),
    likes: num(raw.diggCount ?? raw.digg_count),
    comments: num(raw.commentCount ?? raw.comment_count),
    shares: num(raw.shareCount ?? raw.share_count),
    postedAt,
    author: {
      username,
      avatarUrl: str(authorMeta.avatar) || str(authorMeta.avatar_thumb) || undefined,
    },
  };
}

// Instagram: apify~instagram-scraper
export function normalizeInstagramVideo(raw: AnyObj): NormalizedVideo {
  const shortCode = str(raw.shortCode) || str(raw.code);
  const id = str(raw.id) || shortCode;
  const externalUrl =
    str(raw.url) ||
    (shortCode ? `https://www.instagram.com/p/${shortCode}/` : "");

  const timestamp = str(raw.timestamp);
  const postedAt = timestamp
    ? new Date(timestamp).toISOString()
    : new Date(0).toISOString();

  return {
    id: `ig-${id}`,
    platform: "instagram",
    videoUrl: externalUrl,
    thumbnailUrl: str(raw.displayUrl) || str(raw.thumbnailUrl),
    caption: str(raw.caption),
    views: num(raw.videoViewCount ?? raw.videoPlayCount),
    likes: num(raw.likesCount),
    comments: num(raw.commentsCount),
    shares: num(
      raw.reshareCount ?? raw.resharesCount ?? raw.shareCount ?? raw.sharesCount
    ),
    postedAt,
    author: {
      username: str(raw.ownerUsername),
      avatarUrl: undefined,
    },
  };
}
