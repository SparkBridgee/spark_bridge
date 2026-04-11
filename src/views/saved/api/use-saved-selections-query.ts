"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/client";
import { queryKeys } from "@/shared/config/query-keys";

export interface SavedSelectionRow {
  id: string;
  platform: "tiktok" | "instagram";
  account_username: string;
  video_count: number;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  avg_shares: number;
  avg_reposts: number;
  cost: number;
  created_at: string;
}

export interface SavedSelectionVideoRow {
  id: string;
  selection_id: string;
  video_id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  repost_count: number | null;
  posted_at: string | null;
}

export interface SavedSelectionWithVideos extends SavedSelectionRow {
  videos: SavedSelectionVideoRow[];
}

export function useSavedSelectionsQuery() {
  return useQuery({
    queryKey: queryKeys.savedSelections(),
    queryFn: async (): Promise<SavedSelectionWithVideos[]> => {
      const supabase = createSupabaseBrowserClient();

      const { data: selections, error } = await supabase
        .from("saved_selections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!selections || selections.length === 0) return [];

      const ids = selections.map((s) => s.id);

      const { data: videos, error: vErr } = await supabase
        .from("saved_selection_videos")
        .select("*")
        .in("selection_id", ids);

      if (vErr) throw vErr;

      const grouped = new Map<string, SavedSelectionVideoRow[]>();
      for (const v of videos ?? []) {
        const arr = grouped.get(v.selection_id) ?? [];
        arr.push(v);
        grouped.set(v.selection_id, arr);
      }

      return selections.map((s) => ({
        ...s,
        videos: grouped.get(s.id) ?? [],
      }));
    },
    staleTime: 60_000,
  });
}
