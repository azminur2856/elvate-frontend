"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/** "2d 04:13:09" / "04:13:09", or "2d 4h 13m" without seconds. */
export function formatRemaining(ms: number, withSeconds = true): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (!withSeconds) {
    // Round up so "0m" only shows when the sale has actually ended.
    const mins = Math.ceil(total / 60);
    const dd = Math.floor(mins / 1440);
    const hh = Math.floor((mins % 1440) / 60);
    const mm = mins % 60;
    return [dd ? `${dd}d` : "", dd || hh ? `${hh}h` : "", `${mm}m`].filter(Boolean).join(" ");
  }
  const clock = `${pad(h)}:${pad(m)}:${pad(s)}`;
  return d > 0 ? `${d}d ${clock}` : clock;
}

type CountdownTimerProps = {
  /** ISO date the countdown ends at. */
  endsAt: string;
  /** Text before the time. */
  label?: string;
  /** Called once when the time runs out. */
  onExpire?: () => void;
  /** Smaller, icon-only-label variant for product cards. */
  compact?: boolean;
  className?: string;
};

/**
 * Flash-sale countdown. Ticks every second; with `prefers-reduced-motion`
 * it drops the seconds and updates every 30 s instead. The time only renders
 * after mount, so server and client HTML match. It is a `timer` region (not
 * live), so screen readers are not interrupted every second; the end time
 * is available as text.
 */
export function CountdownTimer({
  endsAt,
  label = "Ends in",
  onExpire,
  compact = false,
  className,
}: CountdownTimerProps) {
  const reduced = useReducedMotion();
  const [now, setNow] = useState<number | null>(null);
  const end = new Date(endsAt).getTime();
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, reduced ? 30_000 : 1000);
    return () => window.clearInterval(id);
  }, [reduced]);

  const remaining = now === null || Number.isNaN(end) ? null : Math.max(0, end - now);
  const expired = remaining === 0;

  useEffect(() => {
    if (expired) onExpireRef.current?.();
  }, [expired]);

  // Locale + time zone differ between server and browser: client-only text.
  const endLabel =
    now === null || Number.isNaN(end)
      ? ""
      : new Date(end).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  return (
    <span
      role="timer"
      aria-live="off"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium text-brand",
        compact ? "text-xs" : "text-sm",
        className
      )}
    >
      <Timer aria-hidden="true" className={compact ? "size-3.5" : "size-4"} />
      {expired ? (
        <span>Ended</span>
      ) : (
        <>
          <span className={compact ? "sr-only" : undefined}>{label}</span>
          <span className="tabular-nums" suppressHydrationWarning>
            {remaining === null ? "--:--:--" : formatRemaining(remaining, !reduced)}
          </span>
          {endLabel ? <span className="sr-only">(ends {endLabel})</span> : null}
        </>
      )}
    </span>
  );
}
