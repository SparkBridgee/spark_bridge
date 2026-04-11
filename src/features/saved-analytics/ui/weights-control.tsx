"use client";

import { RotateCcw } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
} from "@/shared/ui";
import { useUIStore } from "@/shared/lib/stores/ui-store";
import { WEIGHT_PRESETS } from "../lib/presets";
import type { ErWeights } from "../lib/calculate";

const WEIGHT_FIELDS: Array<{ key: keyof ErWeights; label: string }> = [
  { key: "likes", label: "좋아요" },
  { key: "comments", label: "댓글" },
  { key: "shares", label: "공유" },
];

function isWeightsEqual(a: ErWeights, b: ErWeights) {
  return a.likes === b.likes && a.comments === b.comments && a.shares === b.shares;
}

export function WeightsControl() {
  const erWeights = useUIStore((s) => s.erWeights);
  const setErWeight = useUIStore((s) => s.setErWeight);
  const setErWeights = useUIStore((s) => s.setErWeights);
  const resetErWeights = useUIStore((s) => s.resetErWeights);

  return (
    <Card>
      <CardHeader className="gap-1 space-y-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">ER 가중치</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetErWeights}
            className="h-7 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            초기화
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          좋아요·댓글·공유에 가중치를 곱해 ER을 계산합니다.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {WEIGHT_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <Label htmlFor={`er-weight-${key}`} className="text-xs">
                {label}
              </Label>
              <Input
                id={`er-weight-${key}`}
                type="number"
                inputMode="decimal"
                min={0}
                max={10}
                step={0.1}
                value={erWeights[key]}
                onChange={(e) => {
                  const v = e.target.valueAsNumber;
                  if (Number.isNaN(v)) {
                    setErWeight(key, 0);
                  } else {
                    setErWeight(key, v);
                  }
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {WEIGHT_PRESETS.map((preset) => {
            const active = isWeightsEqual(erWeights, preset.weights);
            return (
              <Button
                key={preset.label}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => setErWeights(preset.weights)}
                className="h-7 px-2.5 text-xs"
              >
                {preset.label}
                <span className="ml-1 opacity-70">
                  {preset.weights.likes}:{preset.weights.comments}:
                  {preset.weights.shares}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
