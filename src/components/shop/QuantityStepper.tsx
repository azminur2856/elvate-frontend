"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  /** Upper bound (stock and the 10-per-line cap). */
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md";
  /** Accessible name of the field, e.g. "Quantity for Blue T-shirt". */
  label?: string;
  className?: string;
};

/**
 * − [n] + stepper. The field is a native number input (spinbutton role) so
 * screen readers announce the value and range. Typing commits on blur /
 * Enter; arrow keys and the buttons commit immediately, clamped to range.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
  size = "md",
  label = "Quantity",
  className,
}: QuantityStepperProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const upper = Math.max(min, max);

  const clamp = (n: number) => Math.min(upper, Math.max(min, Math.trunc(n)));

  const commit = (n: number) => {
    const next = clamp(n);
    setDraft(null);
    if (next !== value) onChange(next);
  };

  const commitDraft = () => {
    if (draft === null) return;
    const n = Number(draft);
    if (draft.trim() === "" || !Number.isFinite(n)) {
      setDraft(null);
      return;
    }
    commit(n);
  };

  const btnSize = size === "sm" ? "icon-sm" : "icon";
  const field = size === "sm" ? "h-8 w-10 text-sm" : "h-9 w-12";

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      className={cn("inline-flex items-center rounded-md border bg-background", className)}
    >
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      <Button
        type="button"
        variant="ghost"
        size={btnSize}
        className="rounded-r-none"
        onClick={() => commit(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus aria-hidden="true" />
      </Button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={upper}
        step={1}
        value={draft ?? String(value)}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitDraft();
          } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            commit((draft !== null ? Number(draft) || value : value) + (e.key === "ArrowUp" ? 1 : -1));
          }
        }}
        className={cn(
          "border-x bg-transparent text-center font-medium tabular-nums outline-none disabled:opacity-50",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          field
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size={btnSize}
        className="rounded-l-none"
        onClick={() => commit(value + 1)}
        disabled={disabled || value >= upper}
        aria-label="Increase quantity"
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
