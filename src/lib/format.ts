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

/** ISO string → value for <input type="datetime-local"> in the viewer's time zone. */
export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value (local time) → ISO UTC string, or undefined. */
export function fromDateTimeLocal(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}
