"use client";

import { useId } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type SpecRow = { key: string; value: string };

export const specsToRows = (specs: Record<string, string> | null | undefined): SpecRow[] =>
  Object.entries(specs ?? {}).map(([key, value]) => ({ key, value }));

export const rowsToSpecs = (rows: SpecRow[]): Record<string, string> =>
  Object.fromEntries(rows.filter((r) => r.key.trim() && r.value.trim()).map((r) => [r.key.trim(), r.value.trim()]));

/** Key / value list ("Fit" → "Regular"). Empty rows are ignored on save. */
export function SpecsEditor({ rows, onChange }: { rows: SpecRow[]; onChange: (rows: SpecRow[]) => void }) {
  const id = useId();
  const set = (i: number, patch: Partial<SpecRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium">Specifications</legend>
      {rows.length ? (
        <ul className="grid gap-2">
          {rows.map((r, i) => (
            <li key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
              <Input
                aria-label={`Specification ${i + 1} name`}
                placeholder="e.g. Fit"
                value={r.key}
                maxLength={40}
                onChange={(e) => set(i, { key: e.target.value })}
              />
              <Input
                aria-label={`Specification ${i + 1} value`}
                placeholder="e.g. Regular"
                value={r.value}
                maxLength={120}
                onChange={(e) => set(i, { value: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
                aria-label={`Remove specification ${r.key || i + 1}`}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p id={`${id}-empty`} className="text-sm text-muted-foreground">
          No specifications yet.
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => onChange([...rows, { key: "", value: "" }])}
      >
        <Plus aria-hidden="true" />
        Add specification
      </Button>
    </fieldset>
  );
}
