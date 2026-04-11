const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const KRW_FRAC = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 2,
});

export function formatEr(er: number | null): string {
  if (er === null || !Number.isFinite(er)) return "—";
  return `${er.toFixed(2)}%`;
}

export function formatCpv(cpv: number | null): string {
  if (cpv === null || !Number.isFinite(cpv)) return "—";
  const fmt = cpv >= 1 ? KRW.format(Math.round(cpv)) : KRW_FRAC.format(cpv);
  return `${fmt} / view`;
}

export function formatCost(cost: number): string {
  if (!Number.isFinite(cost) || cost <= 0) return "";
  return KRW.format(cost);
}
