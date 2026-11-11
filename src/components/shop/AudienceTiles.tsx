import Link from "next/link";
import { Baby, ShoppingBag, UserRound } from "lucide-react";
import type { Category } from "@/types/commerce";
import { categoryHref } from "@/lib/catalog-url";
import { cn } from "@/lib/utils";
import { ProductImage } from "./ProductImage";

/** Used when the categories API is unavailable: the root routes always exist. */
const FALLBACK: Pick<Category, "id" | "name" | "slug" | "imageUrl" | "productCount">[] = [
  { id: "men", name: "Men", slug: "men", imageUrl: null, productCount: 0 },
  { id: "women", name: "Women", slug: "women", imageUrl: null, productCount: 0 },
  { id: "children", name: "Children", slug: "children", imageUrl: null, productCount: 0 },
];

const ICONS: Record<string, typeof UserRound> = { men: UserRound, women: ShoppingBag, children: Baby };

/** Men / Women / Children tiles from the category roots. */
export function AudienceTiles({ categories, className }: { categories: Category[] | null; className?: string }) {
  const roots = categories?.length
    ? [...categories].filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder)
    : FALLBACK;

  return (
    <ul className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {roots.map((c) => {
        const Icon = ICONS[c.slug] ?? ShoppingBag;
        return (
          <li key={c.id}>
            <Link
              href={categoryHref(c.slug)}
              className="group relative flex aspect-[4/3] overflow-hidden rounded-xl border bg-muted focus-visible:ring-offset-background sm:aspect-[3/4] lg:aspect-[4/3]"
            >
              {c.imageUrl ? (
                <ProductImage
                  src={c.imageUrl}
                  alt=""
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-grid text-muted-foreground">
                  <Icon aria-hidden="true" className="size-16 opacity-40" />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-background via-background/80 to-transparent p-4 pt-12">
                <span>
                  <span className="block font-heading text-2xl font-bold text-foreground">{c.name}</span>
                  {c.productCount > 0 ? (
                    <span className="text-sm text-muted-foreground">
                      {c.productCount} {c.productCount === 1 ? "product" : "products"}
                    </span>
                  ) : null}
                </span>
                <span className="rounded-full bg-brand px-3 py-1 text-sm font-medium text-brand-foreground">Shop</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
