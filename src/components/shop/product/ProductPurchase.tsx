"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import type { ProductDetail, ProductVariant } from "@/types/commerce";
import { cn } from "@/lib/utils";
import { MAX_PER_LINE, useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "../CountdownTimer";
import { PriceTag } from "../PriceTag";
import { QuantityStepper } from "../QuantityStepper";

const unique = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))];
const LOW_STOCK = 5;

function OptionGroup({
  legend,
  options,
  value,
  onChange,
  isAvailable,
}: {
  legend: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  isAvailable: (v: string) => boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">
        {legend}
        {value ? <span className="font-normal text-muted-foreground">: {value}</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const available = isAvailable(o);
          const selected = value === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={selected}
              aria-disabled={!available || undefined}
              onClick={() => onChange(o)}
              title={available ? undefined : `${o} is out of stock`}
              className={cn(
                "relative min-w-11 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                selected ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent",
                !available && "text-muted-foreground line-through decoration-1",
                !available && selected && "bg-muted text-muted-foreground"
              )}
            >
              {o}
              {!available ? <span className="sr-only"> (out of stock)</span> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Price, variant picker, quantity and Add to cart. Works logged out (guest cart). */
export function ProductPurchase({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { addItem, quantityOf, setMiniCartOpen } = useCart();
  const variants = product.variants;
  const sizes = useMemo(() => unique(variants.map((v) => v.size)), [variants]);
  const colors = useMemo(() => unique(variants.map((v) => v.color)), [variants]);

  const firstInStock = variants.find((v) => v.stock > 0);
  const [color, setColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : (firstInStock?.color ?? null)
  );
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const needsSize = sizes.length > 0 && !size;
  const needsColor = colors.length > 0 && !color;
  const selected: ProductVariant | null =
    needsSize || needsColor
      ? null
      : (variants.find(
          (v) => (sizes.length ? v.size === size : true) && (colors.length ? v.color === color : true)
        ) ?? null);

  const sizeAvailable = (s: string) =>
    variants.some((v) => v.size === s && (!color || !colors.length || v.color === color) && v.stock > 0);
  const colorAvailable = (c: string) =>
    variants.some((v) => v.color === c && (!size || !sizes.length || v.size === size) && v.stock > 0);

  const inCart = selected ? quantityOf(selected.id) : 0;
  const maxQty = selected ? Math.max(0, Math.min(MAX_PER_LINE, selected.stock) - inCart) : MAX_PER_LINE;
  const qty = Math.min(quantity, Math.max(1, maxQty));

  const price = selected?.price ?? product.price;
  const effective = selected?.effectivePrice ?? product.effectivePrice;

  let stockText: React.ReactNode = null;
  if (selected) {
    if (selected.stock <= 0) stockText = <span className="text-destructive">Out of stock</span>;
    else if (maxQty <= 0) stockText = <span className="text-muted-foreground">You already have the maximum in your cart.</span>;
    else if (selected.stock <= LOW_STOCK) stockText = <span className="font-medium text-warning">Only {selected.stock} left</span>;
    else stockText = <span className="text-success">In stock</span>;
  } else if (!product.inStock) {
    stockText = <span className="text-destructive">Out of stock</span>;
  }

  const buttonLabel = !variants.length
    ? "Unavailable"
    : needsSize
      ? "Select a size"
      : needsColor
        ? "Select a colour"
        : !selected || selected.stock <= 0
          ? "Out of stock"
          : maxQty <= 0
            ? "Limit reached"
            : "Add to cart";
  const canAdd = buttonLabel === "Add to cart";

  const add = async () => {
    if (!selected || !canAdd) return;
    setAdding(true);
    const ok = await addItem(selected.id, qty);
    setAdding(false);
    if (ok) {
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 2000);
      toast.success(`Added ${qty} × ${product.name} to your cart.`);
      setQuantity(1);
      setMiniCartOpen(true);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <PriceTag price={price} effectivePrice={effective} size="lg" />
        {product.flashSaleEndsAt ? (
          <CountdownTimer
            endsAt={product.flashSaleEndsAt}
            label="Flash sale ends in"
            onExpire={() => router.refresh()}
          />
        ) : null}
      </div>

      {colors.length > 0 ? (
        <OptionGroup
          legend="Colour"
          options={colors}
          value={color}
          onChange={setColor}
          isAvailable={colorAvailable}
        />
      ) : null}
      {sizes.length > 0 ? (
        <OptionGroup legend="Size" options={sizes} value={size} onChange={setSize} isAvailable={sizeAvailable} />
      ) : null}

      <p className="min-h-5 text-sm" aria-live="polite">
        {stockText}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={qty}
          onChange={setQuantity}
          min={1}
          max={Math.max(1, maxQty)}
          disabled={!canAdd}
          label={`Quantity of ${product.name}`}
        />
        <Button size="lg" className="min-w-48 flex-1 sm:flex-none" onClick={add} disabled={!canAdd} loading={adding}>
          {adding ? null : justAdded ? <Check aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />}
          {justAdded ? "Added" : buttonLabel}
        </Button>
      </div>
      {inCart > 0 ? (
        <p className="-mt-3 text-sm text-muted-foreground">
          You already have {inCart} in your cart.
        </p>
      ) : null}
    </div>
  );
}
