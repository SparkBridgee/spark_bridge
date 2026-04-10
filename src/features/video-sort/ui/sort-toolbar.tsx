"use client";

import { cn } from "@/shared/lib/utils";
import { SORT_OPTIONS, type SortKey } from "@/features/video-sort/model/types";

interface SortToolbarProps {
  value: SortKey;
  onChange: (key: SortKey) => void;
}

export function SortToolbar({ value, onChange }: SortToolbarProps) {
  return (
    <div
      role="radiogroup"
      aria-label="정렬"
      className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1"
    >
      {SORT_OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
