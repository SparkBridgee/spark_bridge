"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/client";
import { queryKeys } from "@/shared/config/query-keys";

export function useDeleteSelectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("saved_selections")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.savedSelections() });
    },
  });
}
