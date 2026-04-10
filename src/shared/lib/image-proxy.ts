/**
 * Wrap a remote image URL through our /api/image-proxy route so the browser
 * avoids hot-linking issues (Instagram/TikTok CDNs block cross-origin requests
 * without the right Referer).
 */
export function proxiedImage(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("/")) return url;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
