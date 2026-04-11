"use client";

import { cn } from "@/shared/lib/utils";
import { formatCpv, formatEr } from "../lib/format";

interface MetricsBadgeProps {
  er: number | null;
  cpv: number | null;
  className?: string;
}

export function MetricsBadge({ er, cpv, className }: MetricsBadgeProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
          er === null
            ? "border-muted bg-muted/40 text-muted-foreground"
            : "border-primary/30 bg-primary/10 text-primary"
        )}
      >
        <span className="font-semibold uppercase tracking-wide opacity-70">ER</span>
        <span>{formatEr(er)}</span>
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
          cpv === null
            ? "border-muted bg-muted/40 text-muted-foreground"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        )}
      >
        <span className="font-semibold uppercase tracking-wide opacity-70">CPV</span>
        <span>{formatCpv(cpv)}</span>
      </span>
    </div>
  );
}
