"use client";

import Link from "next/link";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { CartLine } from "@/types/commerce";
import { productHref } from "@/lib/catalog-url";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/shop/ProductImage";
import { QuantityStepper } from "@/components/shop/QuantityStepper";
import { MAX_PER_LINE, useCart } from "./CartProvider";

export const variantLabel = (l: { size: string | null; color: string | null }) =>
  [l.size, l.color].filter(Boolean).join(" · ");

/** Why a line can't be bought as is (null = fine). */
export function lineProblem(l: CartLine): string | null {
  if (l.available) return null;
  if (l.stock <= 0) return "Out of stock. Remove it to continue.";
  if (l.quantity > l.stock) return `Only ${l.stock} left. Lower the quantity to continue.`;
  return "No longer available. Remove it to continue.";
}

/** One cart line with quantity stepper + remove. `compact` for the mini cart. */
export function CartLineItem({
  line,
  compact = false,
  onNavigate,
}: {
  line: CartLine;
  compact?: boolean;
  /** Called when the product link is followed (closes the mini cart). */
  onNavigate?: () => void;
}) {
  const { setQuantity, removeLine } = useCart();
  const label = variantLabel(line);
  const problem = lineProblem(line);
  const max = Math.max(1, Math.min(MAX_PER_LINE, line.stock));

  return (
    <article className={cn("flex gap-3", compact ? "py-3" : "py-5 sm:gap-5")}>
      <Link
        href={productHref(line.slug)}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden="true"
        className={cn("relative shrink-0 overflow-hidden rounded-lg border", compact ? "size-16" : "size-20 sm:size-24")}
      >
        <ProductImage src={line.image} alt="" sizes="96px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className={cn("font-sans font-medium leading-snug", compact ? "line-clamp-2 text-sm" : "text-base")}>
              <Link href={productHref(line.slug)} onClick={onNavigate} className="hover:underline">
                {line.name}
              </Link>
            </h3>
            {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
          </div>
          <p className={cn("shrink-0 text-right font-semibold tabular-nums", compact && "text-sm")}>
            {formatBDT(line.lineTotal)}
          </p>
        </div>
        {!compact ? (
          <p className="text-sm text-muted-foreground tabular-nums">{formatBDT(line.unitPrice)} each</p>
        ) : null}
        {problem ? (
          <p className="flex items-start gap-1.5 text-sm text-destructive" role="status">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {problem}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            min={1}
            max={max}
            disabled={line.stock <= 0}
            label={`Quantity of ${line.name}${label ? ` (${label})` : ""}`}
            onChange={(q) => void setQuantity(line, q)}
          />
          <Button
            variant="ghost"
            size={compact ? "icon-sm" : "sm"}
            className="text-muted-foreground hover:text-destructive"
            onClick={() => void removeLine(line)}
            aria-label={`Remove ${line.name}${label ? ` (${label})` : ""} from cart`}
          >
            <Trash2 aria-hidden="true" />
            {compact ? null : <span aria-hidden="true">Remove</span>}
          </Button>
        </div>
      </div>
    </article>
  );
}
