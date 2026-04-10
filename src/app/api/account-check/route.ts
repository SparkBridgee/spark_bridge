import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";

export const runtime = "nodejs";

// Pretend to be a real browser so profile pages don't get blocked.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const COMMON_HEADERS: HeadersInit = {
  "User-Agent": USER_AGENT,
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

interface CheckResult {
  exists: boolean;
  /** True when the check could not determine existence — caller should proceed. */
  unknown?: boolean;
}

async function checkTikTok(username: string): Promise<CheckResult> {
  const url = `https://www.tiktok.com/@${encodeURIComponent(username)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(8000),
    redirect: "follow",
  });

  if (res.status === 404) return { exists: false };
  if (!res.ok) return { exists: true, unknown: true };

  const html = await res.text();

  // TikTok returns 200 even for missing users — detect via in-page markers.
  const notFoundMarkers = [
    '"statusCode":10202',
    '"statusCode":10221',
    "Couldn't find this account",
    "Couldn&#x27;t find this account",
    '"userInfo":null',
  ];
  if (notFoundMarkers.some((m) => html.includes(m))) {
    return { exists: false };
  }
  return { exists: true };
}

async function checkInstagram(username: string): Promise<CheckResult> {
  const url = `https://www.instagram.com/${encodeURIComponent(username)}/`;
  const res = await fetch(url, {
    method: "GET",
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(8000),
    redirect: "manual",
  });

  if (res.status === 404) return { exists: false };

  // Instagram bounces missing usernames to /accounts/login/
  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get("location") || "";
    if (loc.includes("/accounts/login")) return { exists: false };
    return { exists: true, unknown: true };
  }

  if (!res.ok) return { exists: true, unknown: true };

  const html = await res.text();
  const notFoundMarkers = [
    "Sorry, this page isn",
    "이 페이지를 사용할 수 없습니다",
    '"PolarisErrorRoot"',
  ];
  if (notFoundMarkers.some((m) => html.includes(m))) {
    return { exists: false };
  }
  return { exists: true };
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const b = (body || {}) as { platform?: unknown; username?: unknown };
  const platform =
    b.platform === "tiktok" || b.platform === "instagram" ? b.platform : null;
  const rawUsername = typeof b.username === "string" ? b.username : "";
  const username = rawUsername.replace(/^@/, "").trim();

  if (!platform) {
    return NextResponse.json({ error: "invalid platform" }, { status: 400 });
  }
  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  try {
    const result =
      platform === "tiktok"
        ? await checkTikTok(username)
        : await checkInstagram(username);
    return NextResponse.json({ ...result, platform, username });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "check failed";
    console.warn("[api/account-check]", msg);
    // On network error, let the caller proceed rather than block a legit search.
    return NextResponse.json({
      exists: true,
      unknown: true,
      platform,
      username,
    });
  }
}
