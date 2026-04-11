import type { NormalizedVideo } from "@/entities/video/model/types";
import type { SortDir, SortKey } from "@/features/video-sort/model/types";

export function sortVideos(
  videos: NormalizedVideo[],
  key: SortKey,
  dir: SortDir = "desc"
): NormalizedVideo[] {
  const copy = [...videos];
  // `mul = 1` keeps the natural "descending" semantics of each comparator
  // (newest-first / biggest-first). `mul = -1` flips to ascending.
  const mul = dir === "desc" ? 1 : -1;
  switch (key) {
    case "latest":
      return copy.sort(
        (a, b) =>
          (new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()) *
          mul
      );
    case "views":
      return copy.sort((a, b) => (b.views - a.views) * mul);
    case "likes":
      return copy.sort((a, b) => (b.likes - a.likes) * mul);
    case "comments":
      return copy.sort((a, b) => (b.comments - a.comments) * mul);
    case "shares":
      return copy.sort((a, b) => (b.shares - a.shares) * mul);
    default:
      return copy;
  }
}
