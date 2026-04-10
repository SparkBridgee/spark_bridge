"use client";

import { useUIStore } from "@/shared/lib/stores/ui-store";
import type { NormalizedVideo } from "@/entities/video/model/types";

export function useVideoSelect() {
  const selectedVideoIds = useUIStore((s) => s.selectedVideoIds);
  const toggleVideo = useUIStore((s) => s.toggleVideo);
  const selectMany = useUIStore((s) => s.selectMany);
  const clearSelection = useUIStore((s) => s.clearSelection);

  const selectedCount = Object.keys(selectedVideoIds).length;

  function isSelected(id: string): boolean {
    return !!selectedVideoIds[id];
  }

  function pickSelected(all: NormalizedVideo[]): NormalizedVideo[] {
    return all.filter((v) => selectedVideoIds[v.id]);
  }

  return {
    selectedVideoIds,
    selectedCount,
    isSelected,
    toggle: toggleVideo,
    selectAll: selectMany,
    clear: clearSelection,
    pickSelected,
  };
}
