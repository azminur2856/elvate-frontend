import { Check } from "lucide-react";
import type { OrderDetail, OrderStatus } from "@/types/commerce";
import { ORDER_FLOW, ORDER_STATUS_LABELS, roleLabel } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { LocalTime } from "@/components/shared/LocalTime";
import { STATUS_STYLE } from "./OrderBadges";

type HistoryEntry = OrderDetail["statusHistory"][number];

/**
 * Status timeline. Shows every step of the normal flow (done / current /
 * upcoming) with the time it happened; cancelled or returned orders show
 * the actual history instead.
 */
export function OrderTimeline({
  status,
  history,
  className,
}: {
  status: OrderStatus;
  history: HistoryEntry[];
  className?: string;
}) {
  const sorted = [...history].sort((a, b) => a.at.localeCompare(b.at));
  const offFlow = status === "CANCELLED" || status === "RETURNED";
  const currentIndex = ORDER_FLOW.indexOf(status);

  type Step = { status: OrderStatus; entry: HistoryEntry | undefined; state: "done" | "current" | "upcoming" };
  const steps: Step[] = offFlow
    ? sorted.map((entry, i) => ({
        status: entry.status,
        entry,
        state: i === sorted.length - 1 ? "current" : "done",
      }))
    : ORDER_FLOW.map((s, i) => ({
        status: s,
        // last time the order entered this status
        entry: [...sorted].reverse().find((h) => h.status === s),
        // Delivered is the end of the road: show it as completed.
        state:
          i < currentIndex || (i === currentIndex && status === "DELIVERED")
            ? "done"
            : i === currentIndex
              ? "current"
              : "upcoming",
      }));

  return (
    <ol className={cn("grid gap-0", className)}>
      {steps.map((step, i) => {
        const Icon = STATUS_STYLE[step.status]?.icon ?? Check;
        const last = i === steps.length - 1;
        const terminalBad = step.state === "current" && (step.status === "CANCELLED" || step.status === "RETURNED");
        return (
          <li key={`${step.status}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!last ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5",
                  step.state === "done" ? "bg-primary" : "bg-border"
                )}
              />
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                step.state === "done" && "border-primary bg-primary text-primary-foreground",
                step.state === "current" && !terminalBad && "border-primary bg-background text-primary",
                terminalBad && "border-destructive bg-background text-destructive",
                step.state === "upcoming" && "border-border bg-background text-muted-foreground"
              )}
            >
              {step.state === "done" ? <Check className="size-4" /> : <Icon className="size-4" />}
            </span>
            <div className="min-w-0 pt-1">
              <p className={cn("font-medium", step.state === "upcoming" && "text-muted-foreground")}>
                {ORDER_STATUS_LABELS[step.status] ?? step.status}
                <span className="sr-only">
                  {step.state === "done" ? " (done)" : step.state === "current" ? " (current)" : " (upcoming)"}
                </span>
              </p>
              {step.entry ? (
                <p className="text-sm text-muted-foreground">
                  <LocalTime value={step.entry.at} mode="datetime" />
                  {step.entry.by ? (
                    <>
                      {" · "}by {step.entry.by.name}
                      {step.entry.by.role ? ` (${roleLabel(step.entry.by.role)})` : ""}
                    </>
                  ) : null}
                </p>
              ) : null}
              {step.entry?.note ? (
                <p className="mt-1 rounded-md bg-muted px-2.5 py-1.5 text-sm">{step.entry.note}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
