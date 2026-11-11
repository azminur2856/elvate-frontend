import Link from "next/link";
import type { OrderDetail, OrderItem } from "@/types/commerce";
import { productHref } from "@/lib/catalog-url";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/shop/ProductImage";

/** Snapshot of the order lines; `action` renders per-line controls (Review). */
export function OrderItemsList({
  items,
  action,
  className,
}: {
  items: OrderItem[];
  action?: (item: OrderItem) => React.ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("divide-y", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-lg border sm:size-20">
            <ProductImage src={item.image} alt="" sizes="80px" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug">
                  {item.slug ? (
                    <Link href={productHref(item.slug)} className="hover:underline">
                      {item.productName}
                    </Link>
                  ) : (
                    item.productName
                  )}
                </p>
                {item.variantLabel ? <p className="text-sm text-muted-foreground">{item.variantLabel}</p> : null}
              </div>
              <p className="shrink-0 font-semibold tabular-nums">{formatBDT(item.lineTotal)}</p>
            </div>
            <p className="text-sm text-muted-foreground tabular-nums">
              {item.quantity} × {formatBDT(item.unitPrice)}
            </p>
            {action ? <div className="mt-1">{action(item)}</div> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Subtotal / discount / shipping / total. */
export function OrderTotals({
  subtotal,
  discount,
  shippingFee,
  total,
  couponCode,
  className,
}: {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-2 text-sm", className)}>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tabular-nums">{formatBDT(subtotal)}</dd>
      </div>
      {discount > 0 ? (
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Discount{couponCode ? ` (${couponCode})` : ""}</dt>
          <dd className="tabular-nums text-success">−{formatBDT(discount)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Delivery</dt>
        <dd className="tabular-nums">{shippingFee > 0 ? formatBDT(shippingFee) : "Free"}</dd>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t pt-3">
        <dt className="font-semibold">Total</dt>
        <dd className="font-heading text-xl font-bold tabular-nums">{formatBDT(total)}</dd>
      </div>
    </dl>
  );
}

/** Postal address block (order snapshot or saved address). */
export function AddressLines({
  address,
  className,
}: {
  address: Pick<OrderDetail["shippingAddress"], "fullName" | "phone" | "addressLine" | "area" | "city" | "postalCode">;
  className?: string;
}) {
  return (
    <address className={cn("grid gap-0.5 text-sm not-italic", className)}>
      <span className="font-medium">{address.fullName}</span>
      <span>{address.addressLine}</span>
      <span>{[address.area, address.city, address.postalCode].filter(Boolean).join(", ")}</span>
      <a href={`tel:${address.phone}`} className="text-link hover:underline">
        {address.phone}
      </a>
    </address>
  );
}
