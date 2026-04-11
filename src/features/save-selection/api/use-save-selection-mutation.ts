"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/client";
import { queryKeys } from "@/shared/config/query-keys";
import type { NormalizedVideo, Platform } from "@/entities/video/model/types";

interface SaveSelectionInput {
  platform: Platform;
  username: string;
  videos: NormalizedVideo[];
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function useSaveSelectionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ platform, username, videos }: SaveSelectionInput) => {
      if (videos.length === 0) throw new Error("선택된 영상이 없습니다.");
      const supabase = createSupabaseBrowserClient();

      // Grab the current authenticated user — required so the RLS insert
      // policy `auth.uid() = user_id` passes with_check even if the DB default
      // is not honoured for some reason.
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        throw new Error("로그인이 필요합니다.");
      }

      const avgViews = average(videos.map((v) => v.views));
      const avgLikes = average(videos.map((v) => v.likes));
      const avgComments = average(videos.map((v) => v.comments));
      const avgShares = average(videos.map((v) => v.shares));
      const avgReposts = average(videos.map((v) => v.reposts));

      const { data: inserted, error: insertErr } = await supabase
        .from("saved_selections")
        .insert({
          user_id: user.id,
          platform,
          account_username: username,
          video_count: videos.length,
          avg_views: avgViews,
          avg_likes: avgLikes,
          avg_comments: avgComments,
          avg_shares: avgShares,
          avg_reposts: avgReposts,
        })
        .select("id")
        .single();

      if (insertErr || !inserted) {
        throw new Error(insertErr?.message || "저장 실패");
      }

      const selectionId = inserted.id as string;

      const childRows = videos.map((v) => ({
        selection_id: selectionId,
        video_id: v.id,
        video_url: v.videoUrl,
        thumbnail_url: v.thumbnailUrl || null,
        caption: v.caption || null,
        view_count: v.views,
        like_count: v.likes,
        comment_count: v.comments,
        share_count: v.shares,
        repost_count: v.reposts,
        posted_at: v.postedAt || null,
      }));

      const { error: childErr } = await supabase
        .from("saved_selection_videos")
        .insert(childRows);

      if (childErr) {
        // Best-effort cleanup of parent row
        await supabase.from("saved_selections").delete().eq("id", selectionId);
        throw new Error(childErr.message || "저장 실패");
      }

      return { id: selectionId };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.savedSelections() });
    },
  });
}
