"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/client";
import { queryKeys } from "@/shared/config/query-keys";
import { toast } from "@/shared/ui";
import type { SavedSelectionWithVideos } from "@/views/saved/api/use-saved-selections-query";

type Variables = { id: string; cost: number };
type Context = { previous: SavedSelectionWithVideos[] | undefined };

export function useUpdateSelectionCostMutation() {
  const qc = useQueryClient();

  return useMutation<unknown, Error, Variables, Context>({
    mutationFn: async ({ id, cost }) => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("saved_selections")
        .update({ cost })
        .eq("id", id);
      if (error) throw error;
      return { id, cost };
    },
    onMutate: async ({ id, cost }) => {
      await qc.cancelQueries({ queryKey: queryKeys.savedSelections() });
      const previous = qc.getQueryData<SavedSelectionWithVideos[]>(
        queryKeys.savedSelections()
      );
      if (previous) {
        qc.setQueryData<SavedSelectionWithVideos[]>(
          queryKeys.savedSelections(),
          previous.map((row) => (row.id === id ? { ...row, cost } : row))
        );
      }
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queryKeys.savedSelections(), ctx.previous);
      }
      toast.error(err instanceof Error ? err.message : "비용 저장에 실패했습니다.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.savedSelections() });
    },
  });
}
