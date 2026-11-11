"use client";

import type { OrderStatus } from "@/types/commerce";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { cn } from "@/lib/utils";

type StatusTabsProps = {
  value: OrderStatus | null;
  onChange: (status: OrderStatus | null) => void;
  statuses: OrderStatus[];
  /** Optional counts per status (admin), plus `all`. */
  counts?: Partial<Record<OrderStatus | "all", number>>;
  label?: string;
  className?: string;
};

/** Horizontally scrollable status filter ("All", "Pending", …). */
export function StatusTabs({ value, onChange, statuses, counts, label = "Filter by status", className }: StatusTabsProps) {
  const tabs: { key: OrderStatus | null; text: string; count?: number }[] = [
    { key: null, text: "All", count: counts?.all },
    ...statuses.map((s) => ({ key: s, text: ORDER_STATUS_LABELS[s], count: counts?.[s] })),
  ];
  return (
    <div role="group" aria-label={label} className={cn("-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}>
      <div className="flex w-max gap-1 rounded-lg border bg-muted/50 p-1">
        {tabs.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.text}
              {t.count !== undefined ? (
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums",
                    active ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  {t.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
