export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export function formatMoney(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Bangladeshi taka for shop prices: `formatBDT(1250)` → `৳1,250`,
 * `formatBDT(99.5)` → `৳99.50`, `formatBDT(-200)` → `−৳200`.
 * A fixed locale keeps server and client output identical (no hydration
 * mismatch). Subscriptions are in USD and keep using `formatMoney`.
 */
export function formatBDT(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n)) return "৳0";
  const abs = Math.abs(n);
  const hasFraction = Math.round(abs * 100) % 100 !== 0;
  const digits = abs.toLocaleString("en-US", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  });
  return `${n < 0 ? "−" : ""}৳${digits}`;
}

export const PLAN_LABELS: Record<string, string> = {
  "1m": "1 month",
  "6m": "6 months",
  "12m": "12 months",
};
