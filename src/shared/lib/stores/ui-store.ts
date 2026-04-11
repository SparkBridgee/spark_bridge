"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Platform } from "@/entities/video/model/types";
import {
  DEFAULT_WEIGHTS,
} from "@/features/saved-analytics/lib/presets";
import type { ErWeights } from "@/features/saved-analytics/lib/calculate";

type RecentQueriesByPlatform = Record<Platform, string[]>;

const EMPTY_RECENT: RecentQueriesByPlatform = { tiktok: [], instagram: [] };

type UIState = {
  activePlatform: Platform;
  recentQueries: RecentQueriesByPlatform;
  selectedVideoIds: Record<string, true>;
  erWeights: ErWeights;
  setActivePlatform: (p: Platform) => void;
  pushQuery: (platform: Platform, q: string) => void;
  removeQuery: (platform: Platform, q: string) => void;
  clearQueries: (platform: Platform) => void;
  toggleVideo: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  setErWeight: (key: keyof ErWeights, value: number) => void;
  setErWeights: (weights: ErWeights) => void;
  resetErWeights: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      activePlatform: "tiktok",
      recentQueries: { ...EMPTY_RECENT },
      selectedVideoIds: {},
      erWeights: { ...DEFAULT_WEIGHTS },
      setActivePlatform: (p) => set({ activePlatform: p }),
      pushQuery: (platform, q) => {
        const trimmed = q.trim();
        if (!trimmed) return;
        const current = get().recentQueries[platform] ?? [];
        const next = [trimmed, ...current.filter((x) => x !== trimmed)].slice(0, 8);
        set({
          recentQueries: { ...get().recentQueries, [platform]: next },
        });
      },
      removeQuery: (platform, q) => {
        const current = get().recentQueries[platform] ?? [];
        set({
          recentQueries: {
            ...get().recentQueries,
            [platform]: current.filter((x) => x !== q),
          },
        });
      },
      clearQueries: (platform) =>
        set({
          recentQueries: { ...get().recentQueries, [platform]: [] },
        }),
      toggleVideo: (id) => {
        const current = { ...get().selectedVideoIds };
        if (current[id]) delete current[id];
        else current[id] = true;
        set({ selectedVideoIds: current });
      },
      selectMany: (ids) => {
        const next: Record<string, true> = {};
        for (const id of ids) next[id] = true;
        set({ selectedVideoIds: next });
      },
      clearSelection: () => set({ selectedVideoIds: {} }),
      isSelected: (id) => !!get().selectedVideoIds[id],
      setErWeight: (key, value) => {
        const next = Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : 0;
        set({ erWeights: { ...get().erWeights, [key]: next } });
      },
      setErWeights: (weights) => set({ erWeights: { ...weights } }),
      resetErWeights: () => set({ erWeights: { ...DEFAULT_WEIGHTS } }),
    }),
    {
      name: "spark-ui",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      // v1 -> v2: recentQueries was a flat string[], now per-platform.
      // v2 -> v3: add erWeights with default values.
      migrate: (persisted, version) => {
        let p = (persisted ?? {}) as {
          activePlatform?: Platform;
          recentQueries?: unknown;
          erWeights?: ErWeights;
        };
        if (version < 2) {
          const activePlatform: Platform = p.activePlatform ?? "tiktok";
          const oldList = Array.isArray(p.recentQueries)
            ? (p.recentQueries as string[])
            : [];
          p = {
            activePlatform,
            recentQueries: { ...EMPTY_RECENT, [activePlatform]: oldList },
          };
        }
        if (version < 3) {
          return { ...p, erWeights: { ...DEFAULT_WEIGHTS } };
        }
        return p;
      },
      // Only persist tab, recent queries, and ER weights; selection is ephemeral.
      partialize: (state) => ({
        activePlatform: state.activePlatform,
        recentQueries: state.recentQueries,
        erWeights: state.erWeights,
      }),
    }
  )
);
