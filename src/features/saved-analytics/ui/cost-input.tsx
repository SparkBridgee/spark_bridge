"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Input, Label } from "@/shared/ui";
import { useUpdateSelectionCostMutation } from "../api/use-update-selection-cost-mutation";

interface CostInputProps {
  selectionId: string;
  initialCost: number;
}

const DEBOUNCE_MS = 700;

export function CostInput({ selectionId, initialCost }: CostInputProps) {
  const [value, setValue] = useState<string>(
    initialCost > 0 ? String(initialCost) : ""
  );
  const [lastSeenInitial, setLastSeenInitial] = useState<number>(initialCost);
  const [savedCost, setSavedCost] = useState<number>(initialCost);
  const [showSaved, setShowSaved] = useState(false);
  const mutation = useUpdateSelectionCostMutation();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync if parent updates initialCost (e.g. after refetch). Done during render
  // via the "derived state from props" pattern to avoid setState-in-effect.
  if (initialCost !== lastSeenInitial) {
    setLastSeenInitial(initialCost);
    setSavedCost(initialCost);
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed) || parsed !== initialCost) {
      setValue(initialCost > 0 ? String(initialCost) : "");
    }
  }

  function flush(raw: string) {
    const parsed = raw.trim() === "" ? 0 : Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    if (parsed === savedCost) return;
    setSavedCost(parsed);
    mutation.mutate(
      { id: selectionId, cost: parsed },
      {
        onSuccess: () => {
          setShowSaved(true);
          if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
          savedTimerRef.current = setTimeout(() => setShowSaved(false), 1500);
        },
      }
    );
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    setShowSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flush(next), DEBOUNCE_MS);
  }

  function onBlur() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    flush(value);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const inputId = `cost-input-${selectionId}`;

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={inputId} className="text-xs text-muted-foreground">
        광고 비용
      </Label>
      <div className="relative flex-1 sm:max-w-[220px]">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₩
        </span>
        <Input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="0"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="pl-7 pr-8"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : showSaved ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : null}
        </span>
      </div>
    </div>
  );
}
