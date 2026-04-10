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

// Instagram: apify~instagram-reel-scraper (active)
//
// 필드명은 공식 스키마 문서가 부족해 방어적으로 여러 후보를 파싱함.
// 기존 apify~instagram-scraper 출력과도 호환되도록 fallback 체인을 유지.
export function normalizeInstagramVideo(raw: AnyObj): NormalizedVideo {
  const shortCode = str(raw.shortCode) || str(raw.code) || str(raw.shortcode);
  const id = str(raw.id) || shortCode;
  const externalUrl =
    str(raw.url) ||
    str(raw.reelUrl) ||
    (shortCode ? `https://www.instagram.com/reel/${shortCode}/` : "");

  const timestampRaw = raw.timestamp ?? raw.takenAt ?? raw.taken_at;
  const timestampStr =
    typeof timestampRaw === "string" ? timestampRaw : "";
  const timestampNum =
    typeof timestampRaw === "number" ? timestampRaw : 0;
  const postedAt = timestampStr
    ? new Date(timestampStr).toISOString()
    : timestampNum
      ? new Date(
          timestampNum > 1e12 ? timestampNum : timestampNum * 1000
        ).toISOString()
      : new Date(0).toISOString();

  return {
    id: `ig-${id}`,
    platform: "instagram",
    videoUrl: externalUrl,
    thumbnailUrl:
      str(raw.displayUrl) ||
      str(raw.thumbnailUrl) ||
      str(raw.thumbnail) ||
      str(raw.imageUrl),
    caption: str(raw.caption),
    views: num(
      raw.videoViewCount ??
        raw.videoPlayCount ??
        raw.playCount ??
        raw.viewCount ??
        raw.views
    ),
    likes: num(raw.likesCount ?? raw.likeCount ?? raw.likes),
    comments: num(raw.commentsCount ?? raw.commentCount ?? raw.comments),
    shares: num(
      raw.sharesCount ??
        raw.shareCount ??
        raw.resharesCount ??
        raw.reshareCount ??
        raw.shares
    ),
    postedAt,
    author: {
      username:
        str(raw.ownerUsername) ||
        str(raw.username) ||
        str((raw.owner as AnyObj | undefined)?.username),
      avatarUrl:
        str(raw.ownerProfilePicUrl) ||
        str((raw.owner as AnyObj | undefined)?.profile_pic_url) ||
        undefined,
    },
  };
}
