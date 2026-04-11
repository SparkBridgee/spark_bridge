import type { ErWeights } from "./calculate";

export const DEFAULT_WEIGHTS: ErWeights = { likes: 1, comments: 1, shares: 1 };

export const WEIGHT_PRESETS: Array<{ label: string; weights: ErWeights }> = [
  { label: "균등", weights: { likes: 1, comments: 1, shares: 1 } },
  { label: "참여 중시", weights: { likes: 1, comments: 2, shares: 3 } },
  { label: "확산 중시", weights: { likes: 1, comments: 3, shares: 5 } },
];
