"use client";

import { useId, useState } from "react";
import type { ProductFilters } from "@/types/commerce";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCatalog } from "./CatalogContext";

const ALL_BRANDS = "__all__";

function niceStep(range: number) {
  if (range > 20_000) return 500;
  if (range > 5_000) return 100;
  if (range > 500) return 50;
  return 10;
}

function PriceFilter({ min, max }: { min: number; max: number }) {
  const { params, update } = useCatalog();
  const id = useId();
  const step = niceStep(max - min);
  const lo = Math.floor(min / step) * step;
  const hi = Math.max(lo + step, Math.ceil(max / step) * step);
  const clamp = (n: number) => Math.min(hi, Math.max(lo, n));
  const [value, setValue] = useState<[number, number]>([
    clamp(params.minPrice ?? lo),
    clamp(params.maxPrice ?? hi),
  ]);

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-3 text-sm font-semibold">Price</legend>
      <Slider
        min={lo}
        max={hi}
        step={step}
        minStepsBetweenThumbs={1}
        value={value}
        onValueChange={(v) => setValue([v[0], v[1]] as [number, number])}
        onValueCommit={(v) =>
          update({
            minPrice: v[0] > lo ? v[0] : undefined,
            maxPrice: v[1] < hi ? v[1] : undefined,
          })
        }
        thumbLabels={["Minimum price", "Maximum price"]}
        thumbValueTexts={[formatBDT(value[0]), formatBDT(value[1])]}
        aria-describedby={`${id}-range`}
      />
      <p id={`${id}-range`} className="flex justify-between text-sm tabular-nums text-muted-foreground">
        <span>{formatBDT(value[0])}</span>
        <span>{formatBDT(value[1])}</span>
      </p>
    </fieldset>
  );
}

function toggle(list: string[] | undefined, item: string): string[] | undefined {
  const set = new Set(list ?? []);
  if (set.has(item)) set.delete(item);
  else set.add(item);
  return set.size ? [...set] : undefined;
}

/** Sidebar / sheet filters. Every change updates the URL immediately. */
export function CatalogFilters({ facets }: { facets: ProductFilters | null }) {
  const { params, update } = useCatalog();
  const id = useId();

  return (
    <div className="grid gap-7">
      {facets && facets.maxPrice > facets.minPrice ? (
        <PriceFilter
          key={`${params.minPrice ?? ""}-${params.maxPrice ?? ""}-${facets.minPrice}-${facets.maxPrice}`}
          min={facets.minPrice}
          max={facets.maxPrice}
        />
      ) : null}

      {facets?.sizes.length ? (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Size</legend>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((size) => {
              const on = params.sizes?.includes(size) ?? false;
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ sizes: toggle(params.sizes, size) })}
                  className={cn(
                    "min-w-10 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors",
                    on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {facets?.colors.length ? (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Colour</legend>
          <ul className="grid gap-2">
            {facets.colors.map((color, i) => {
              const cid = `${id}-color-${i}`;
              return (
                <li key={color} className="flex items-center gap-2">
                  <Checkbox
                    id={cid}
                    checked={params.colors?.includes(color) ?? false}
                    onCheckedChange={() => update({ colors: toggle(params.colors, color) })}
                  />
                  <Label htmlFor={cid} className="font-normal">
                    {color}
                  </Label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}

      {facets?.brands.length ? (
        <div className="grid gap-2">
          <Label htmlFor={`${id}-brand`} className="text-sm font-semibold">
            Brand
          </Label>
          <Select
            value={params.brand ?? ALL_BRANDS}
            onValueChange={(v) => update({ brand: v === ALL_BRANDS ? undefined : v })}
          >
            <SelectTrigger id={`${id}-brand`} className="w-full">
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_BRANDS}>All brands</SelectItem>
              {facets.brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Availability</legend>
        <ul className="grid gap-2">
          <li className="flex items-center gap-2">
            <Checkbox
              id={`${id}-sale`}
              checked={params.onSale ?? false}
              onCheckedChange={(c) => update({ onSale: c === true ? true : undefined })}
            />
            <Label htmlFor={`${id}-sale`} className="font-normal">
              On sale
            </Label>
          </li>
          <li className="flex items-center gap-2">
            <Checkbox
              id={`${id}-stock`}
              checked={params.inStock ?? false}
              onCheckedChange={(c) => update({ inStock: c === true ? true : undefined })}
            />
            <Label htmlFor={`${id}-stock`} className="font-normal">
              In stock only
            </Label>
          </li>
        </ul>
      </fieldset>
    </div>
  );
}
