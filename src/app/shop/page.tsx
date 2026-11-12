import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgePercent, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { getCategoryTree, getProducts } from "@/lib/catalog";
import { AudienceTiles } from "@/components/shop/AudienceTiles";
import { ProductSection } from "@/components/shop/ProductSection";
import { ShopUnavailable } from "@/components/shop/ShopUnavailable";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Clothing and accessories for men, women and children. New arrivals, sale prices and flash deals, with cash on delivery across Bangladesh.",
};

const PERKS = [
  { icon: Truck, title: "Cash on delivery", text: "Pay when your order arrives" },
  { icon: ShieldCheck, title: "Secure card payments", text: "Checkout powered by Stripe" },
  { icon: PackageCheck, title: "Track every order", text: "Live status from packing to your door" },
];

export default async function ShopPage() {
  const [categories, newArrivals, onSale, featured] = await Promise.all([
    getCategoryTree(),
    getProducts({ newArrival: true, sort: "newest", pageSize: 4 }),
    getProducts({ onSale: true, sort: "popular", pageSize: 4 }),
    getProducts({ featured: true, sort: "popular", pageSize: 4 }),
  ]);
  const productsDown = !newArrivals.ok && !onSale.ok && !featured.ok;
  const noProducts =
    !productsDown &&
    [newArrivals, onSale, featured].every((r) => !r.ok || r.data.items.length === 0);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-10 sm:px-6">
      <section aria-labelledby="shop-hero" className="relative overflow-hidden rounded-2xl border bg-card">
        <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative grid gap-6 px-6 py-12 sm:px-10 sm:py-16 lg:max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Elvate shop</p>
          <h1 id="shop-hero" className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everyday style for the whole family
          </h1>
          <p className="text-lg text-muted-foreground">
            Shirts, dresses, shoes and kidswear at fair prices. Order online and pay by card or cash on delivery.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/search?newArrival=true">
                Shop new arrivals
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/offers">
                <BadgePercent aria-hidden="true" />
                See offers
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="shop-audiences" className="grid gap-5">
        <h2 id="shop-audiences" className="text-2xl font-bold tracking-tight">
          Shop by collection
        </h2>
        <AudienceTiles categories={categories.ok ? categories.data : null} />
      </section>

      {productsDown ? (
        <ShopUnavailable />
      ) : noProducts ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          New products are on their way. Browse a collection above in the meantime.
        </p>
      ) : (
        <>
          <ProductSection
            id="new-arrivals"
            title="New arrivals"
            description="Fresh in this week."
            href="/search?newArrival=true"
            products={newArrivals.ok ? newArrivals.data.items : []}
            priorityCount={2}
          />
          <ProductSection
            id="on-sale"
            title="On sale"
            description="Marked-down favourites while stock lasts."
            href="/search?onSale=true"
            products={onSale.ok ? onSale.data.items : []}
          />
          <ProductSection
            id="featured"
            title="Featured"
            description="Picked by our team."
            href="/search?featured=true"
            products={featured.ok ? featured.data.items : []}
          />
        </>
      )}

      <section aria-labelledby="offers-banner" className="flex flex-col items-start justify-between gap-4 rounded-2xl border bg-muted/50 p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 id="offers-banner" className="text-xl font-bold">
            Flash sales and coupon codes
          </h2>
          <p className="mt-1 text-muted-foreground">Limited-time deals and public codes you can use at checkout.</p>
        </div>
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/offers">
            View offers
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <ul aria-label="Why shop with us" className="grid gap-4 sm:grid-cols-3">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3 rounded-xl border p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-brand">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <span>
              <span className="block font-medium">{title}</span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
