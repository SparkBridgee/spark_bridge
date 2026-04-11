"use client";

import { formatCost, formatCpv, formatEr } from "../lib/format";
import type { ErWeights } from "../lib/calculate";

interface MetricsDetailProps {
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  videoCount: number;
  total: number;
  cost: number;
  er: number | null;
  cpv: number | null;
  weights: ErWeights;
}

const INT = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

function num(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return INT.format(Math.round(n));
}

export function MetricsDetail({
  avgViews,
  avgLikes,
  avgComments,
  avgShares,
  videoCount,
  total,
  cost,
  er,
  cpv,
  weights,
}: MetricsDetailProps) {
  const weightedNumerator =
    weights.likes * avgLikes +
    weights.comments * avgComments +
    weights.shares * avgShares;

  return (
    <div className="rounded-md border bg-muted/30 p-3 text-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          성과 지표
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">총 조회수</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {num(total)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {num(avgViews)} × {videoCount}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">가중치 ER</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatEr(er)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            ({weights.likes}·{num(avgLikes)} + {weights.comments}·
            {num(avgComments)} + {weights.shares}·{num(avgShares)}) ÷{" "}
            {num(avgViews)}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">CPV</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatCpv(cpv)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {cost > 0 ? `${formatCost(cost)} ÷ ${num(total)}` : "비용 미입력"}
          </span>
        </div>
      </div>

      <div className="mt-2 border-t pt-2 text-[10px] leading-relaxed text-muted-foreground">
        ER(%) = (W<sub>좋아요</sub>·L + W<sub>댓글</sub>·C + W<sub>공유</sub>
        ·S) ÷ V × 100 &nbsp;·&nbsp; CPV = Cost ÷ (V × N) &nbsp;·&nbsp;
        가중치는 상단에서 조정 가능합니다.
        {weightedNumerator > 0 && avgViews > 0 ? (
          <>
            {" "}
            현재 분자 합: {num(weightedNumerator)}
          </>
        ) : null}
      </div>
    </div>
  );
}
