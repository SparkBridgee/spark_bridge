import { NextResponse } from "next/server";

export const runtime = "nodejs";

// SSRF 방지: 허용된 호스트 패턴만 프록시
const ALLOWED_HOST_PATTERNS: RegExp[] = [
  /\.cdninstagram\.com$/,
  /\.fbcdn\.net$/,
  /\.tiktokcdn\.com$/,
  /\.tiktokcdn-us\.com$/,
  /\.tiktokcdn-eu\.com$/,
  /\.tiktok\.com$/,
];

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOST_PATTERNS.some((re) => re.test(hostname));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (target.protocol !== "https:") {
    return NextResponse.json({ error: "https only" }, { status: 400 });
  }

  if (!isAllowedHost(target.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      // Let Node/undici skip the Referer entirely
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `upstream ${upstream.status}` },
        { status: 502 }
      );
    }

    const contentType =
      upstream.headers.get("content-type") || "image/jpeg";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "proxy failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
