export type SortKey = "latest" | "views" | "likes" | "comments" | "shares";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "views", label: "조회수" },
  { key: "likes", label: "좋아요" },
  { key: "comments", label: "댓글" },
  { key: "shares", label: "공유" },
];
