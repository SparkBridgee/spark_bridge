"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  SORT_OPTIONS,
  type SortDir,
  type SortState,
} from "@/features/video-sort/model/types";

interface SortToolbarProps {
  value: SortState;
  onChange: (state: SortState) => void;
}

function flip(dir: SortDir): SortDir {
  return dir === "desc" ? "asc" : "desc";
}

export function SortToolbar({ value, onChange }: SortToolbarProps) {
  return (
    <div
      role="radiogroup"
      aria-label="정렬"
      className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1"
    >
      {SORT_OPTIONS.map((opt) => {
        const active = value.key === opt.key;
        const dir = active ? value.dir : "desc";
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={
              active
                ? `${opt.label}, ${dir === "desc" ? "내림차순" : "오름차순"}`
                : opt.label
            }
            title={
              active
                ? `${opt.label} (${dir === "desc" ? "내림차순" : "오름차순"}) — 클릭하여 방향 전환`
                : `${opt.label}로 정렬`
            }
            onClick={() =>
              onChange(
                active
                  ? { key: opt.key, dir: flip(value.dir) }
                  : { key: opt.key, dir: "desc" }
              )
            }
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {opt.label}
            {active &&
              (dir === "desc" ? (
                <ArrowDown className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
              ))}
          </button>
        );
      })}
    </div>
  );
}
