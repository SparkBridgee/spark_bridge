// Server-only wrapper for Apify clockworks~tiktok-scraper.
// Do NOT import from client components.

import { getServerEnv } from "@/shared/config/env";

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "clockworks~tiktok-scraper";

export type TikTokRawVideo = Record<string, unknown>;

export async function fetchTikTokProfile(
  rawUsername: string,
  limit = 20
): Promise<TikTokRawVideo[]> {
  const { APIFY_API_TOKEN } = getServerEnv();
  const username = rawUsername.replace(/^@/, "").trim();

  if (!username) throw new Error("username is required");

  const res = await fetch(
    `${APIFY_BASE}/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profiles: [username],
        resultsPerPage: limit,
        profileScrapeSections: ["videos"],
        profileSorting: "latest",
        shouldDownloadVideos: false,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify TikTok error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data as TikTokRawVideo[];
}
