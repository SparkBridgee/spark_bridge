"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, Heart, MessageCircle, Share2, Repeat2, X, Save, Loader2 } from "lucide-react";
import { VideoCard } from "@/entities/video/ui/video-card";
import { useVideoSelect } from "@/features/video-select/model/use-video-select";
import { useSaveSelectionMutation } from "@/features/save-selection/api/use-save-selection-mutation";
import { SortToolbar } from "@/features/video-sort/ui/sort-toolbar";
import { sortVideos } from "@/features/video-sort/lib/sort-videos";
import { DEFAULT_SORT, type SortState } from "@/features/video-sort/model/types";
import { Button, toast } from "@/shared/ui";
import { useIntersection } from "@/shared/lib/hooks/use-intersection";
import type { NormalizedVideo, Platform } from "@/entities/video/model/types";

const PAGE_SIZE = 12;

function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toString();
}

interface VideoGridProps {
  videos: NormalizedVideo[];
  platform: Platform;
  username: string;
}

export function VideoGrid({ videos, platform, username }: VideoGridProps) {
  const { isSelected, toggle, pickSelected, selectedCount, clear, selectAll } =
    useVideoSelect();
  const saveMutation = useSaveSelectionMutation();

  const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedVideos = useMemo(
    () => sortVideos(videos, sortState.key, sortState.dir),
    [videos, sortState]
  );

  // Reset pagination when sort state or source list changes — "storing info from
  // previous renders" pattern: https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevSort, setPrevSort] = useState(sortState);
  const [prevVideos, setPrevVideos] = useState(videos);
  if (prevSort !== sortState || prevVideos !== videos) {
    setPrevSort(sortState);
    setPrevVideos(videos);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleVideos = useMemo(
    () => sortedVideos.slice(0, visibleCount),
    [sortedVideos, visibleCount]
  );

  const hasMore = visibleCount < sortedVideos.length;

  const sentinelRef = useIntersection<HTMLDivElement>(
    () => {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, sortedVideos.length));
    },
    { enabled: hasMore, rootMargin: "400px" }
  );

  const selected = useMemo(() => pickSelected(videos), [pickSelected, videos]);

  const avgViews =
    selected.length > 0
      ? selected.reduce((a, v) => a + v.views, 0) / selected.length
      : 0;
  const avgLikes =
    selected.length > 0
      ? selected.reduce((a, v) => a + v.likes, 0) / selected.length
      : 0;
  const avgComments =
    selected.length > 0
      ? selected.reduce((a, v) => a + v.comments, 0) / selected.length
      : 0;
  const avgShares =
    selected.length > 0
      ? selected.reduce((a, v) => a + v.shares, 0) / selected.length
      : 0;
  const avgReposts =
    selected.length > 0
      ? selected.reduce((a, v) => a + v.reposts, 0) / selected.length
      : 0;

  async function onSave() {
    try {
      await saveMutation.mutateAsync({
        platform,
        username,
        videos: selected,
      });
      toast.success(`${selected.length}개 영상의 평균 분석을 저장했습니다.`);
      clear();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "저장 실패";
      toast.error(msg);
    }
  }

  const allIds = sortedVideos.map((v) => v.id);
  const allSelected = selectedCount === sortedVideos.length && sortedVideos.length > 0;

  return (
    <>
      {/* Toolbar: sort + select all */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SortToolbar value={sortState} onChange={setSortState} platform={platform} />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground sm:text-sm">
            {sortedVideos.length}개 · 평균 분석 저장
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (allSelected ? clear() : selectAll(allIds))}
          >
            {allSelected ? "전체 해제" : "전체 선택"}
          </Button>
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-2 gap-3 pb-32 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {visibleVideos.map((v, i) => (
            <motion.div
              key={v.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.28,
                delay: Math.min(i * 0.02, 0.3),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <VideoCard
                video={v}
                selected={isSelected(v.id)}
                onToggleSelect={toggle}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="-mt-24 flex items-center justify-center py-8 text-xs text-muted-foreground"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          불러오는 중...
        </div>
      )}

      {!hasMore && visibleVideos.length > 0 && (
        <div className="-mt-24 pb-8 text-center text-xs text-muted-foreground">
          마지막 영상까지 확인했어요
        </div>
      )}

      {/* Save bar — animated */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] backdrop-blur"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  key={selectedCount}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground sm:h-12 sm:w-12 sm:text-lg"
                >
                  {selectedCount}
                </motion.div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs font-semibold sm:text-sm">
                    선택된 영상 평균
                  </span>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground sm:text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <strong className="text-foreground">
                        {formatCount(avgViews)}
                      </strong>
                      조회
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      <strong className="text-foreground">
                        {formatCount(avgLikes)}
                      </strong>
                      좋아요
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <strong className="text-foreground">
                        {formatCount(avgComments)}
                      </strong>
                      댓글
                    </span>
                    {platform === "instagram" ? (
                      <span
                        className="flex items-center gap-1"
                        title="스토리 reshare + 프로필 repost + DM 공유 합산"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <Repeat2 className="h-3.5 w-3.5 opacity-70" />
                        <strong className="text-foreground">
                          {formatCount(avgShares)}
                        </strong>
                        공유+리포스트
                      </span>
                    ) : (
                      <>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3.5 w-3.5" />
                          <strong className="text-foreground">
                            {formatCount(avgShares)}
                          </strong>
                          공유
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat2 className="h-3.5 w-3.5" />
                          <strong className="text-foreground">
                            {formatCount(avgReposts)}
                          </strong>
                          리포스트
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clear} className="flex-1 sm:flex-none">
                  <X className="h-4 w-4" />
                  해제
                </Button>
                <Button
                  onClick={onSave}
                  loading={saveMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  <Save className="h-4 w-4" />
                  분석 저장
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
