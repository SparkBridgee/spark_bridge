import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { fetchTikTokProfile } from "@/shared/api/apify/tiktok";
import { normalizeTikTokVideo } from "@/entities/video/lib/normalize";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Require authenticated user — protects the server-side Apify token.
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

  const b = (body || {}) as { username?: unknown; limit?: unknown };
  const username = typeof b.username === "string" ? b.username : "";
  const limitRaw = typeof b.limit === "number" ? b.limit : Number(b.limit) || 50;
  const limit = Math.min(100, Math.max(10, Math.trunc(limitRaw)));

  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  try {
    const raw = await fetchTikTokProfile(username, limit);
    const videos = raw.map(normalizeTikTokVideo);
    return NextResponse.json({ videos, username, platform: "tiktok" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    console.error("[api/apify/tiktok]", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
