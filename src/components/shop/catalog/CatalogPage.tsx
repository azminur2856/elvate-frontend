import Link from "next/link";
import { notFound } from "next/navigation";
import type { Category } from "@/types/commerce";
import { getCategory, getProductFilters, getProducts } from "@/lib/catalog";
import { categoryHref, parseCatalogParams, toProductQuery, type CatalogParams } from "@/lib/catalog-url";
import { cn } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "../Breadcrumbs";
import { ProductGrid } from "../ProductGrid";
import { ShopUnavailable } from "../ShopUnavailable";
import { CatalogEmpty, CatalogShell } from "./CatalogShell";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const titleCase = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Heading for the search / "view all" listing. */
export function searchTitle(p: CatalogParams): string {
  if (p.q) return `Results for “${p.q}”`;
  if (p.newArrival) return "New arrivals";
  if (p.onSale) return "On sale";
  if (p.featured) return "Featured";
  return "All products";
}

function SubcategoryLinks({ items }: { items: Category[] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {[...items]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((c) => (
            <li key={c.id}>
              <Link
                href={categoryHref(c.slug)}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium hover:bg-accent"
              >
                {c.name}
                {c.productCount > 0 ? (
                  <span className="text-xs text-muted-foreground tabular-nums">{c.productCount}</span>
                ) : null}
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}

type CatalogPageProps = {
  /** Category slug (root or sub-category); omitted for search / "view all". */
  slug?: string;
  searchParams: RawSearchParams;
  /** Intro text under the heading. */
  description?: string;
};

/**
 * Shared listing page for /shop/men|women|children, /shop/category/[slug]
 * and /search. Server component: fetches products, facets and the category
 * in parallel; the filter UI is a client shell around the server results.
 */
export async function CatalogPage({ slug, searchParams, description }: CatalogPageProps) {
  const params = parseCatalogParams(searchParams);
  const [categoryRes, productsRes, facetsRes] = await Promise.all([
    slug ? getCategory(slug) : Promise.resolve(null),
    getProducts(toProductQuery(params, slug)),
    getProductFilters(slug),
  ]);

  if (categoryRes && !categoryRes.ok && categoryRes.status === 404) notFound();
  const category = categoryRes?.ok ? categoryRes.data : null;

  const title = slug ? (category?.name ?? titleCase(slug)) : searchTitle(params);
  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(slug
      ? (category?.breadcrumb?.length ? category.breadcrumb : [{ name: title, slug }]).map((b) => ({
          label: b.name,
          href: categoryHref(b.slug),
        }))
      : [{ label: params.q ? "Search" : title }]),
  ];

  const products = productsRes.ok ? productsRes.data : null;
  const page = products?.page ?? params.page ?? 1;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <header className={cn("mt-4 grid gap-2", category?.children?.length ? "mb-5" : "mb-8")}>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="max-w-prose text-muted-foreground">{description}</p> : null}
      </header>
      {category?.children?.length ? (
        <div className="mb-8">
          <SubcategoryLinks items={category.children} />
        </div>
      ) : null}

      <CatalogShell
        params={params}
        facets={facetsRes.ok ? facetsRes.data : null}
        total={products?.total ?? null}
        page={page}
        totalPages={products?.totalPages ?? 1}
      >
        {!products ? (
          <ShopUnavailable title="Products are unavailable right now" />
        ) : products.items.length === 0 ? (
          <CatalogEmpty />
        ) : (
          <ProductGrid products={products.items} layout="sidebar" priorityCount={3} cardHeading="h2" />
        )}
      </CatalogShell>
    </div>
  );
}
