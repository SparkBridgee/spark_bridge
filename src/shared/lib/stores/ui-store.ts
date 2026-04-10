"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Platform } from "@/entities/video/model/types";

type UIState = {
  activePlatform: Platform;
  recentQueries: string[];
  selectedVideoIds: Record<string, true>;
  setActivePlatform: (p: Platform) => void;
  pushQuery: (q: string) => void;
  removeQuery: (q: string) => void;
  clearQueries: () => void;
  toggleVideo: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      activePlatform: "tiktok",
      recentQueries: [],
      selectedVideoIds: {},
      setActivePlatform: (p) => set({ activePlatform: p }),
      pushQuery: (q) => {
        const trimmed = q.trim();
        if (!trimmed) return;
        const next = [trimmed, ...get().recentQueries.filter((x) => x !== trimmed)].slice(0, 8);
        set({ recentQueries: next });
      },
      removeQuery: (q) =>
        set({ recentQueries: get().recentQueries.filter((x) => x !== q) }),
      clearQueries: () => set({ recentQueries: [] }),
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
      // Only persist tab + recent queries; selection is ephemeral per session.
      partialize: (state) => ({
        activePlatform: state.activePlatform,
        recentQueries: state.recentQueries,
      }),
    }
  )
);
