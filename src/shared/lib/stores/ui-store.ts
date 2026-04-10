"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Platform } from "@/entities/video/model/types";

type RecentQueriesByPlatform = Record<Platform, string[]>;

const EMPTY_RECENT: RecentQueriesByPlatform = { tiktok: [], instagram: [] };

type UIState = {
  activePlatform: Platform;
  recentQueries: RecentQueriesByPlatform;
  selectedVideoIds: Record<string, true>;
  setActivePlatform: (p: Platform) => void;
  pushQuery: (platform: Platform, q: string) => void;
  removeQuery: (platform: Platform, q: string) => void;
  clearQueries: (platform: Platform) => void;
  toggleVideo: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      activePlatform: "tiktok",
      recentQueries: { ...EMPTY_RECENT },
      selectedVideoIds: {},
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
    }),
    {
      name: "spark-ui",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // v1 -> v2: recentQueries was a flat string[], now per-platform.
      // Migrate the old list into the currently active platform bucket.
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as {
          activePlatform?: Platform;
          recentQueries?: unknown;
        };
        if (version < 2) {
          const activePlatform: Platform = p.activePlatform ?? "tiktok";
          const oldList = Array.isArray(p.recentQueries)
            ? (p.recentQueries as string[])
            : [];
          return {
            activePlatform,
            recentQueries: { ...EMPTY_RECENT, [activePlatform]: oldList },
          };
        }
        return p;
      },
      // Only persist tab + recent queries; selection is ephemeral per session.
      partialize: (state) => ({
        activePlatform: state.activePlatform,
        recentQueries: state.recentQueries,
      }),
    }
  )
);
