"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { AccountHero } from "@/widgets/account-hero/ui/account-hero";
import { VideoGrid } from "@/widgets/video-grid/ui/video-grid";
import { VideoGridSkeleton } from "@/widgets/video-grid/ui/video-grid-skeleton";
import { useAccountVideosQuery } from "@/features/account-search/api/use-account-videos-query";
import { useVideoSelect } from "@/features/video-select/model/use-video-select";
import { Skeleton } from "@/shared/ui";
import type { Platform } from "@/entities/video/model/types";

interface AccountViewProps {
  platform: Platform;
  username: string;
  limit?: number;
}

export function AccountView({
  platform,
  username,
  limit = 50,
}: AccountViewProps) {
  const { data, isLoading, isError, error } = useAccountVideosQuery(
    platform,
    username,
    limit
  );
  const { clear } = useVideoSelect();

  useEffect(() => {
    clear();
  }, [platform, username, clear]);

  const firstVideoAvatar = data?.videos[0]?.author.avatarUrl;
  const videos = data?.videos ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6">
      {isLoading ? (
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 sm:p-6">
          <Skeleton className="h-14 w-14 shrink-0 rounded-full sm:h-16 sm:w-16" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AccountHero
            platform={platform}
            username={username}
            videoCount={videos.length}
            avatarUrl={firstVideoAvatar}
          />
        </motion.div>
      )}

      {isLoading && (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            @{username} 의 최신 {limit}개 영상을 불러오는 중...
          </div>
          <VideoGridSkeleton />
        </>
      )}

      {!isLoading && !isError && videos.length > 0 && (
        <p className="-mb-2 text-[11px] text-muted-foreground sm:text-xs">
          게시일 최신순 기준 · 최대 {limit}개 · 총 {videos.length}개 수집됨
        </p>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          영상을 불러오지 못했습니다:{" "}
          {error instanceof Error ? error.message : "알 수 없는 오류"}
        </div>
      )}

      {!isLoading && !isError && videos.length === 0 && (
        <div className="rounded-md border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
          영상이 없습니다.
        </div>
      )}

      {!isLoading && videos.length > 0 && (
        <VideoGrid videos={videos} platform={platform} username={username} />
      )}
    </div>
  );
}
