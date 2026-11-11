"use client";

import type { FlatCategory } from "@/hooks/useCategoryTree";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE = "__none__";

type CategorySelectProps = {
  id?: string;
  categories: FlatCategory[];
  /** Selected category id, or null for the "none" option. */
  value: string | null;
  onChange: (id: string | null) => void;
  /** Text + presence of the empty option ("All categories", "Top level"). */
  noneLabel?: string;
  /** Ids that can't be chosen (e.g. a category and its descendants). */
  disabledIds?: string[];
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** Category picker showing the tree with indentation. */
export function CategorySelect({
  id,
  categories,
  value,
  onChange,
  noneLabel,
  disabledIds = [],
  placeholder = "Choose a category",
  className,
  ...aria
}: CategorySelectProps) {
  return (
    <Select value={value ?? (noneLabel ? NONE : "")} onValueChange={(v) => onChange(v === NONE ? null : v)}>
      <SelectTrigger id={id} className={className ?? "w-full"} {...aria}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {noneLabel ? <SelectItem value={NONE}>{noneLabel}</SelectItem> : null}
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id} disabled={disabledIds.includes(c.id)} textValue={c.path}>
            <span style={{ paddingLeft: `${c.depth * 1}rem` }} className={c.depth === 0 ? "font-medium" : undefined}>
              {c.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
