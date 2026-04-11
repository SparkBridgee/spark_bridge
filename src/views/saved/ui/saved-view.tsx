"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, Heart, MessageCircle, Share2, Trash2, ChevronDown } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  toast,
} from "@/shared/ui";
import { proxiedImage } from "@/shared/lib/image-proxy";
import {
  useSavedSelectionsQuery,
  type SavedSelectionWithVideos,
} from "@/views/saved/api/use-saved-selections-query";
import { useDeleteSelectionMutation } from "@/views/saved/api/use-delete-selection-mutation";
import { useUIStore } from "@/shared/lib/stores/ui-store";
import {
  CostInput,
  MetricsBadge,
  MetricsDetail,
  WeightsControl,
  calcCpv,
  calcWeightedEr,
  totalViews,
} from "@/features/saved-analytics";

function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toString();
}

function SelectionItem({ selection }: { selection: SavedSelectionWithVideos }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteSelectionMutation();
  const erWeights = useUIStore((s) => s.erWeights);

  const metrics = useMemo(() => {
    const avgViews = Number(selection.avg_views) || 0;
    const avgLikes = Number(selection.avg_likes) || 0;
    const avgComments = Number(selection.avg_comments) || 0;
    const avgShares = Number(selection.avg_shares) || 0;
    const cost = Number(selection.cost) || 0;
    const total = totalViews(avgViews, selection.video_count);
    return {
      avgViews,
      avgLikes,
      avgComments,
      avgShares,
      cost,
      total,
      er: calcWeightedEr(avgViews, avgLikes, avgComments, avgShares, erWeights),
      cpv: calcCpv(cost, total),
    };
  }, [
    selection.avg_views,
    selection.avg_likes,
    selection.avg_comments,
    selection.avg_shares,
    selection.video_count,
    selection.cost,
    erWeights,
  ]);
  const { er, cpv } = metrics;

  async function onDelete() {
    if (!confirm("이 저장 항목을 삭제할까요?")) return;
    try {
      await deleteMutation.mutateAsync(selection.id);
      toast.success("삭제되었습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      <Card>
        <CardHeader className="flex-col items-start gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-medium uppercase">
                {selection.platform}
              </span>
              <span className="truncate">
                {new Date(selection.created_at).toLocaleString()}
              </span>
            </div>
            <h3 className="truncate text-base font-semibold sm:text-lg">
              @{selection.account_username}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{selection.video_count}개 영상</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatCount(selection.avg_views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatCount(selection.avg_likes)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {formatCount(selection.avg_comments)}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                {formatCount(selection.avg_shares)}
              </span>
            </div>
            <MetricsBadge er={er} cpv={cpv} className="mt-1" />
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen((v) => !v)}
              className="flex-1 sm:flex-none"
            >
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
              {open ? "접기" : "펼치기"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              loading={deleteMutation.isPending}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 border-t pt-3">
                  <MetricsDetail
                    avgViews={metrics.avgViews}
                    avgLikes={metrics.avgLikes}
                    avgComments={metrics.avgComments}
                    avgShares={metrics.avgShares}
                    videoCount={selection.video_count}
                    total={metrics.total}
                    cost={metrics.cost}
                    er={metrics.er}
                    cpv={metrics.cpv}
                    weights={erWeights}
                  />
                  <CostInput
                    selectionId={selection.id}
                    initialCost={metrics.cost}
                  />
                </div>
                {selection.videos.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {selection.videos.map((v) => (
                    <li key={v.id} className="flex items-center gap-3 text-sm">
                      {v.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proxiedImage(v.thumbnail_url)}
                          alt=""
                          className="h-14 w-10 flex-shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-14 w-10 flex-shrink-0 rounded bg-muted" />
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <a
                          href={v.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm text-foreground hover:underline"
                        >
                          {v.caption || v.video_url}
                        </a>
                        <span className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Eye className="h-3 w-3" />
                            {formatCount(v.view_count ?? 0)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Heart className="h-3 w-3" />
                            {formatCount(v.like_count ?? 0)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MessageCircle className="h-3 w-3" />
                            {formatCount(v.comment_count ?? 0)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Share2 className="h-3 w-3" />
                            {formatCount(v.share_count ?? 0)}
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export function SavedView() {
  const { data, isLoading, isError, error } = useSavedSelectionsQuery();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold sm:text-2xl">저장된 분석</h1>
        <p className="text-sm text-muted-foreground">
          저장한 영상 묶음과 평균 집계를 확인하세요.
        </p>
      </div>

      <WeightsControl />

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "불러오지 못했습니다."}
        </div>
      )}

      {!isLoading && data && data.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            아직 저장된 항목이 없습니다.
          </CardContent>
        </Card>
      )}

      {data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {data.map((s) => (
              <SelectionItem key={s.id} selection={s} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
