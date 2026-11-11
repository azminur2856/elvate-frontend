import Link from "next/link";
import { TicketPercent, Zap } from "lucide-react";
import type { FlashSale, PublicCoupon } from "@/types/commerce";
import { productHref } from "@/lib/catalog-url";
import { couponHeadline, describeCoupon } from "@/lib/coupons";
import { cn } from "@/lib/utils";
import { LocalTime } from "@/components/shared/LocalTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyCodeButton } from "./CopyCodeButton";
import { CountdownTimer } from "./CountdownTimer";
import { PriceTag } from "./PriceTag";
import { ProductImage } from "./ProductImage";

/** A live flash sale: product, price, big countdown. */
export function FlashSaleCard({ sale, className }: { sale: FlashSale; className?: string }) {
  const p = sale.product;
  return (
    <article
      className={cn(
        "group relative grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-[minmax(0,14rem)_1fr]",
        className
      )}
    >
      <div className="relative aspect-square sm:aspect-auto sm:min-h-56">
        <ProductImage
          src={p.mainImage}
          alt=""
          sizes="(min-width: 640px) 224px, 100vw"
          className="transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <Badge variant="brand" className="absolute left-3 top-3 text-sm">
          <Zap aria-hidden="true" />−{sale.discountPercent}%
        </Badge>
      </div>
      <div className="flex flex-col gap-3 p-5">
        {sale.title ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">{sale.title}</p>
        ) : null}
        <h3 className="text-xl font-semibold leading-snug">
          <Link
            href={productHref(p.slug)}
            className="after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none focus-visible:ring-0"
          >
            {p.name}
          </Link>
        </h3>
        <PriceTag price={p.price} effectivePrice={p.effectivePrice} showBadge={false} />
        <div className="mt-auto rounded-xl bg-muted/60 px-4 py-3">
          <CountdownTimer endsAt={sale.endsAt} label="Ends in" className="text-base" />
        </div>
        {!p.inStock ? <p className="text-sm text-destructive">Sold out</p> : null}
      </div>
    </article>
  );
}

/** A public coupon with its terms and a copy button. */
export function CouponCard({ coupon }: { coupon: PublicCoupon }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-dashed border-brand/50 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
          <TicketPercent aria-hidden="true" className="size-5" />
        </span>
        <p className="font-heading text-2xl font-bold">{couponHeadline(coupon)}</p>
      </div>
      <div className="grid gap-1">
        {coupon.description ? <h3 className="font-medium">{coupon.description}</h3> : null}
        <p className="text-sm text-muted-foreground">{describeCoupon(coupon)}.</p>
        <p className="text-xs text-muted-foreground">
          Valid until <LocalTime value={coupon.expiresAt} />
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2">
        <code className="font-mono text-lg font-semibold tracking-wider">{coupon.code}</code>
        <CopyCodeButton code={coupon.code} />
      </div>
    </article>
  );
}

/** Thin banner for the home page when a flash sale is live. */
export function FlashSaleStrip({ sale }: { sale: FlashSale }) {
  return (
    <section aria-label="Flash sale" className="border-y bg-brand/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 text-center sm:px-6">
        <span className="flex items-center gap-1.5 font-semibold text-brand">
          <Zap aria-hidden="true" className="size-4" />
          {sale.title || "Flash sale"}
        </span>
        <span>
          {sale.discountPercent}% off <span className="font-medium">{sale.product.name}</span>
        </span>
        <CountdownTimer endsAt={sale.endsAt} label="Ends in" />
        <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/offers">See offers</Link>
        </Button>
      </div>
    </section>
  );
}
