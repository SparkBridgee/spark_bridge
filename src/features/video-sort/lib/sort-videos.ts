import type { NormalizedVideo } from "@/entities/video/model/types";
import type { SortKey } from "@/features/video-sort/model/types";

export function sortVideos(
  videos: NormalizedVideo[],
  key: SortKey
): NormalizedVideo[] {
  const copy = [...videos];
  switch (key) {
    case "latest":
      return copy.sort(
        (a, b) =>
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      );
    case "views":
      return copy.sort((a, b) => b.views - a.views);
    case "likes":
      return copy.sort((a, b) => b.likes - a.likes);
    case "comments":
      return copy.sort((a, b) => b.comments - a.comments);
    case "shares":
      return copy.sort((a, b) => b.shares - a.shares);
    default:
      return copy;
  }
}
