// Server-only wrapper for Apify Instagram Reel Scraper.
// Do NOT import from client components.

import { getServerEnv } from "@/shared/config/env";

const APIFY_BASE = "https://api.apify.com/v2";

// -----------------------------------------------------------------------------
// ACTIVE: apify~instagram-reel-scraper
// - Reels 전용 스크래퍼
// - `includeSharesCount: true`로 공유수 수집 가능 (유료 애드온)
// - 일반 피드 포스트(이미지/카로셀)는 제외됨 — 영상 분석 앱 특성상 이게 오히려 적합
// -----------------------------------------------------------------------------
const ACTOR_ID = "apify~instagram-reel-scraper";

export type InstagramRawPost = Record<string, unknown>;

export async function fetchInstagramProfile(
  rawUsername: string,
  limit = 20
): Promise<InstagramRawPost[]> {
  const { APIFY_API_TOKEN } = getServerEnv();
  const username = rawUsername.replace(/^@/, "").trim();

  if (!username) throw new Error("username is required");

  const res = await fetch(
    `${APIFY_BASE}/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: [username],
        resultsLimit: limit,
        includeSharesCount: true,
        skipPinnedPosts: false,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Apify Instagram error ${res.status}: ${text.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data as InstagramRawPost[];
}

// -----------------------------------------------------------------------------
// FALLBACK (legacy): apify~instagram-scraper
// 문제 생기면 아래 코드로 되돌리면 됨. Reels/포스트/카로셀 혼합 응답.
// 공유수(sharesCount)는 반환하지 않음.
// -----------------------------------------------------------------------------
// const LEGACY_ACTOR_ID = "apify~instagram-scraper";
//
// export async function fetchInstagramProfileLegacy(
//   rawUsername: string,
//   limit = 20
// ): Promise<InstagramRawPost[]> {
//   const { APIFY_API_TOKEN } = getServerEnv();
//   const username = rawUsername.replace(/^@/, "").trim();
//
//   if (!username) throw new Error("username is required");
//
//   const res = await fetch(
//     `${APIFY_BASE}/acts/${LEGACY_ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         directUrls: [`https://www.instagram.com/${username}/`],
//         resultsType: "posts",
//         resultsLimit: limit,
//         addParentData: false,
//       }),
//     }
//   );
//
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(
//       `Apify Instagram error ${res.status}: ${text.slice(0, 200)}`
//     );
//   }
//
//   const data = (await res.json()) as unknown;
//   if (!Array.isArray(data)) return [];
//   return data as InstagramRawPost[];
// }
