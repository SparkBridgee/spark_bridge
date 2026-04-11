export type ErWeights = { likes: number; comments: number; shares: number };

export function totalViews(avgViews: number, videoCount: number): number {
  return Math.round(avgViews * videoCount);
}

export function calcCpv(cost: number, total: number): number | null {
  if (!Number.isFinite(cost) || !Number.isFinite(total)) return null;
  if (cost <= 0 || total <= 0) return null;
  return cost / total;
}

export function calcWeightedEr(
  avgViews: number,
  avgLikes: number,
  avgComments: number,
  avgShares: number,
  w: ErWeights
): number | null {
  if (!Number.isFinite(avgViews) || avgViews <= 0) return null;
  const numerator =
    w.likes * avgLikes + w.comments * avgComments + w.shares * avgShares;
  return (numerator / avgViews) * 100;
}
