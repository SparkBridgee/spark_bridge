"use client";

import { motion } from "motion/react";
import { Check, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { proxiedImage } from "@/shared/lib/image-proxy";
import type { NormalizedVideo } from "@/entities/video/model/types";

function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toString();
}

interface VideoCardProps {
  video: NormalizedVideo;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function VideoCard({ video, selected, onToggleSelect }: VideoCardProps) {
  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleSelect?.(video.id);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow",
        selected
          ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "hover:shadow-lg"
      )}
    >
      {/* Selection checkbox — always visible */}
      <button
        type="button"
        aria-label={selected ? "선택 해제" : "선택"}
        aria-pressed={selected}
        onClick={handleToggle}
        className={cn(
          "absolute left-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-md border-2 shadow-md transition-all",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-white bg-black/40 text-white/80 backdrop-blur hover:bg-black/60 hover:text-white"
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>

      {/* Thumbnail + hover overlay */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") handleToggle(e);
        }}
        className="relative block aspect-[9/16] cursor-pointer overflow-hidden bg-muted"
      >
        {video.thumbnailUrl ? (
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            src={proxiedImage(video.thumbnailUrl)}
            alt={video.caption || "video thumbnail"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            no preview
          </div>
        )}

        {/* Hover stats overlay */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 opacity-0 transition-opacity duration-200 sm:p-3",
            "group-hover:opacity-100",
            selected && "opacity-100"
          )}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-white sm:text-xs">
            <span className="flex items-center gap-0.5">
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {formatCount(video.views)}
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {formatCount(video.likes)}
            </span>
            <span className="flex items-center gap-0.5">
              <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {formatCount(video.comments)}
            </span>
            <span className="flex items-center gap-0.5">
              <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {formatCount(video.shares)}
            </span>
          </div>
        </div>

        {/* External link (opens in new tab) */}
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label="원본 열기"
          className="absolute right-2 top-2 z-10 rounded-md bg-background/90 px-2 py-1 text-[10px] font-semibold text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
        >
          원본 ↗
        </a>
      </div>

      {/* Caption */}
      <div className="flex flex-col gap-1 p-2.5 sm:p-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-xs text-foreground/90 sm:text-sm">
          {video.caption || "—"}
        </p>
      </div>
    </motion.div>
  );
}
