import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "./SectionHeading";

/**
 * The shop has no products yet. When it does, replace this card with a
 * grid of product cards — the previous unreachable markup was removed.
 */
function FeaturedProduct() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="featured-products">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Featured products" title="Exclusive products & offers" />
        <div className="mt-12 flex justify-center">
          <Card className="w-full max-w-sm text-center">
            <CardContent className="flex flex-col items-center gap-3 pt-6">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-brand">
                <PackageOpen aria-hidden="true" className="size-6" />
              </span>
              <Badge variant="warning">Coming soon</Badge>
              <h3 className="text-xl font-semibold">Our product line is almost here</h3>
              <p className="text-sm text-muted-foreground">
                Trending gadgets, lifestyle essentials and exclusive deals — stay tuned.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/shop">Visit the shop</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProduct;
