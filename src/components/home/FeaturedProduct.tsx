import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";

/**
 * Featured products from the shop (server-fetched, cached 60 s). When the
 * API is asleep or nothing is featured yet, a simple link to the shop is shown.
 */
async function FeaturedProduct() {
  const res = await getProducts({ featured: true, sort: "popular", pageSize: 8 });
  const products = res.ok ? res.data.items : [];

  return (
    <section className="py-16 sm:py-20" aria-labelledby="featured-products">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading id="featured-products" eyebrow="Featured products" title="Picked for you in the shop" />
        {products.length ? (
          <ProductGrid products={products} className="mt-12" />
        ) : (
          <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-brand">
              <ShoppingBag aria-hidden="true" className="size-6" />
            </span>
            <p className="text-lg font-semibold">Clothing for men, women and children</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Browse the collections, order online and pay by card or cash on delivery.
            </p>
          </div>
        )}
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/shop">
              Visit the shop
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProduct;
