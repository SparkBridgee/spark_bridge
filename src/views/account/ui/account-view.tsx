"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AccountHero } from "@/widgets/account-hero/ui/account-hero";
import { VideoGrid } from "@/widgets/video-grid/ui/video-grid";
import { VideoGridSkeleton } from "@/widgets/video-grid/ui/video-grid-skeleton";
import { useAccountCheckQuery } from "@/features/account-search/api/use-account-check-query";
import { useAccountVideosQuery } from "@/features/account-search/api/use-account-videos-query";
import { useVideoSelect } from "@/features/video-select/model/use-video-select";
import { Skeleton } from "@/shared/ui";
import type { Platform } from "@/entities/video/model/types";

interface AccountViewProps {
  platform: Platform;
  username: string;
}

type Stage = "checking" | "notfound" | "fetching" | "error" | "done";

export function AccountView({ platform, username }: AccountViewProps) {
  const checkQuery = useAccountCheckQuery(platform, username);
  const accountMissing = checkQuery.data?.exists === false;
  const videosEnabled = checkQuery.isSuccess && !accountMissing;

  const videosQuery = useAccountVideosQuery(
    platform,
    username,
    50,
    videosEnabled
  );

  const { clear } = useVideoSelect();

  useEffect(() => {
    clear();
  }, [platform, username, clear]);

  const stage: Stage = checkQuery.isLoading
    ? "checking"
    : accountMissing
      ? "notfound"
      : videosQuery.isError
        ? "error"
        : videosQuery.data
          ? "done"
          : "fetching";

  const loadingText =
    stage === "checking"
      ? `@${username} 계정이 있는지 확인하는 중...`
      : stage === "fetching"
        ? `@${username} 의 영상을 불러오는 중...`
        : "";

  const showSkeletonHero = stage === "checking" || stage === "fetching";
  const firstVideoAvatar = videosQuery.data?.videos[0]?.author.avatarUrl;
  const videos = videosQuery.data?.videos ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6">
      {showSkeletonHero ? (
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 sm:p-6">
          <Skeleton className="h-14 w-14 shrink-0 rounded-full sm:h-16 sm:w-16" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ) : stage === "done" ? (
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
      ) : null}

      {(stage === "checking" || stage === "fetching") && (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={stage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {loadingText}
              </motion.span>
            </AnimatePresence>
          </div>
          <VideoGridSkeleton />
        </>
      )}

      {stage === "notfound" && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
          <p className="font-semibold">
            @{username} 계정을 찾을 수 없습니다.
          </p>
          <p className="mt-1 text-xs text-destructive/80">
            아이디 철자를 확인하거나 다른 계정을 검색해 주세요.
          </p>
        </div>
      )}

      {stage === "error" && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          영상을 불러오지 못했습니다:{" "}
          {videosQuery.error instanceof Error
            ? videosQuery.error.message
            : "알 수 없는 오류"}
        </div>
      )}

      {stage === "done" && videos.length === 0 && (
        <div className="rounded-md border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
          영상이 없습니다. 비공개 계정이거나 게시물이 없을 수 있어요.
        </div>
      )}

      {stage === "done" && videos.length > 0 && (
        <VideoGrid videos={videos} platform={platform} username={username} />
      )}
    </div>
  );
}
