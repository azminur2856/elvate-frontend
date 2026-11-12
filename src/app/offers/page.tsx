import type { Metadata } from "next";
import { BadgePercent, TicketPercent, Zap } from "lucide-react";
import { getOffers, getProducts } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { CouponCard, FlashSaleCard } from "@/components/shop/OfferCards";
import { EmptyState } from "@/components/shop/EmptyState";
import { ProductSection } from "@/components/shop/ProductSection";
import { ShopUnavailable } from "@/components/shop/ShopUnavailable";

export const metadata: Metadata = {
  title: "Offers",
  description: "Live flash sales, sale prices and coupon codes at the Elvate shop.",
};

export default async function OffersPage() {
  const [offersRes, saleRes] = await Promise.all([
    getOffers(),
    getProducts({ onSale: true, sort: "popular", pageSize: 8 }),
  ]);
  const offers = offersRes.ok ? offersRes.data : null;
  const flashSales = offers?.flashSales ?? [];
  const coupons = offers?.publicCoupons ?? [];
  const onSale = saleRes.ok ? saleRes.data.items : [];
  const allDown = !offersRes.ok && !saleRes.ok;
  const nothing = !allDown && !flashSales.length && !coupons.length && !onSale.length;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-8 sm:px-6">
      <div className="grid gap-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Offers" }]} />
        <header className="grid gap-2">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <BadgePercent aria-hidden="true" className="size-8 text-brand" />
            Offers
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Flash sales end when the timer runs out. Coupon codes are applied at checkout.
          </p>
        </header>
      </div>

      {allDown ? <ShopUnavailable title="Offers are unavailable right now" /> : null}

      {nothing ? (
        <EmptyState
          icon={BadgePercent}
          title="No offers right now"
          description="New deals are added regularly. Check back soon."
        />
      ) : null}

      {flashSales.length ? (
        <section aria-labelledby="flash-sales" className="grid gap-5">
          <h2 id="flash-sales" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Zap aria-hidden="true" className="size-6 text-brand" />
            Flash sales
          </h2>
          <ul className="grid gap-5 lg:grid-cols-2">
            {flashSales.map((s) => (
              <li key={s.id}>
                <FlashSaleCard sale={s} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {coupons.length ? (
        <section aria-labelledby="coupons" className="grid gap-5">
          <h2 id="coupons" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <TicketPercent aria-hidden="true" className="size-6 text-brand" />
            Coupon codes
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => (
              <li key={c.code}>
                <CouponCard coupon={c} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ProductSection
        id="on-sale"
        title="On sale now"
        description="Marked-down prices while stock lasts."
        href="/search?onSale=true"
        products={onSale}
      />
    </div>
  );
}
