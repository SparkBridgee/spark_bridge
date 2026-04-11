"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Input, Label } from "@/shared/ui";
import { useUpdateSelectionCostMutation } from "../api/use-update-selection-cost-mutation";

interface CostInputProps {
  selectionId: string;
  initialCost: number;
  compact?: boolean;
}

const DEBOUNCE_MS = 700;

export function CostInput({
  selectionId,
  initialCost,
  compact = false,
}: CostInputProps) {
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

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      flush(value);
      e.currentTarget.blur();
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const inputId = `cost-input-${selectionId}`;

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact ? "flex-none" : "w-full"
      )}
    >
      {!compact && (
        <Label htmlFor={inputId} className="text-xs text-muted-foreground">
          광고 비용
        </Label>
      )}
      <div
        className={cn(
          "relative",
          compact ? "w-[150px]" : "flex-1 sm:max-w-[220px]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
            compact ? "left-2" : "left-3"
          )}
        >
          ₩
        </span>
        <Input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder={compact ? "광고 비용" : "0"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={cn(
            compact ? "h-8 pl-6 pr-7 text-xs" : "pl-7 pr-8"
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            compact ? "right-1.5" : "right-2"
          )}
        >
          {mutation.isPending ? (
            <Loader2 className={cn(compact ? "h-3 w-3" : "h-4 w-4", "animate-spin")} />
          ) : showSaved ? (
            <Check className={cn(compact ? "h-3 w-3" : "h-4 w-4", "text-emerald-500")} />
          ) : null}
        </span>
      </div>
    </div>
  );
}
