"use client";

import { useState, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { Button, Input, Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { useUIStore } from "@/shared/lib/stores/ui-store";
import type { Platform } from "@/entities/video/model/types";

export function SearchForm() {
  const router = useRouter();
  const activePlatform = useUIStore((s) => s.activePlatform);
  const setActivePlatform = useUIStore((s) => s.setActivePlatform);
  const pushQuery = useUIStore((s) => s.pushQuery);
  const removeQuery = useUIStore((s) => s.removeQuery);
  const clearQueries = useUIStore((s) => s.clearQueries);
  const recentQueries = useUIStore(
    (s) => s.recentQueries[activePlatform] ?? []
  );

  const [username, setUsername] = useState("");

  function go(platform: Platform, raw: string) {
    const cleaned = raw.replace(/^@/, "").trim();
    if (!cleaned) return;
    pushQuery(platform, cleaned);
    router.push(`/account/${platform}/${encodeURIComponent(cleaned)}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    go(activePlatform, username);
  }

  function onRemoveChip(e: MouseEvent, q: string) {
    e.stopPropagation();
    e.preventDefault();
    removeQuery(activePlatform, q);
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs
        value={activePlatform}
        onValueChange={(v) => setActivePlatform(v as Platform)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
        <Input
          type="text"
          name="username"
          placeholder={
            activePlatform === "tiktok" ? "예: khaby.lame" : "예: humansofny"
          }
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" className="shrink-0">
          검색
        </Button>
      </form>

      {recentQueries.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              최근 검색어 · {activePlatform === "tiktok" ? "TikTok" : "Instagram"}
            </p>
            <button
              type="button"
              onClick={() => clearQueries(activePlatform)}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {recentQueries.map((q) => (
                <motion.div
                  key={`${activePlatform}-${q}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: -10 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="group inline-flex items-center overflow-hidden rounded-full border border-input bg-background text-xs text-foreground transition-colors hover:bg-accent"
                >
                  <button
                    type="button"
                    onClick={() => go(activePlatform, q)}
                    className="py-1 pl-3 pr-1.5"
                  >
                    @{q}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onRemoveChip(e, q)}
                    aria-label={`${q} 삭제`}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
