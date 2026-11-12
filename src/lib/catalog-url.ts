/**
 * Catalog URL state: the listing filters live in the URL search params
 * (shareable, back-button safe). Pure helpers, usable on server and client.
 * Param names match the `GET /products` query so they pass straight through.
 */
import type { ProductQuery, ProductSort } from "@/types/commerce";

export const CATALOG_PAGE_SIZE = 12;

/** Root categories have their own landing URLs. */
export const ROOT_CATEGORIES = ["men", "women", "children"] as const;
export type RootCategory = (typeof ROOT_CATEGORIES)[number];

export const isRootCategory = (slug: string): slug is RootCategory =>
  (ROOT_CATEGORIES as readonly string[]).includes(slug);

export function categoryHref(slug: string): string {
  return isRootCategory(slug) ? `/shop/${slug}` : `/shop/category/${encodeURIComponent(slug)}`;
}

export const productHref = (slug: string) => `/shop/product/${encodeURIComponent(slug)}`;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];
export const DEFAULT_SORT: ProductSort = "newest";

/** Filter state as it appears in the URL (category comes from the route). */
export type CatalogParams = Omit<ProductQuery, "category" | "pageSize">;

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function read(raw: RawParams, key: string): string | undefined {
  if (raw instanceof URLSearchParams) return raw.get(key) ?? undefined;
  const v = raw[key];
  return Array.isArray(v) ? v[0] : v;
}

const num = (v: string | undefined) => {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
const bool = (v: string | undefined) => (v === "true" || v === "1" ? true : undefined);
const list = (v: string | undefined) => {
  const items = (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? [...new Set(items)] : undefined;
};

/** URL search params → typed filter state (invalid values are dropped). */
export function parseCatalogParams(raw: RawParams): CatalogParams {
  const sort = read(raw, "sort");
  const page = num(read(raw, "page"));
  const q = read(raw, "q")?.trim();
  return {
    q: q ? q.slice(0, 100) : undefined,
    minPrice: num(read(raw, "minPrice")),
    maxPrice: num(read(raw, "maxPrice")),
    sizes: list(read(raw, "sizes")),
    colors: list(read(raw, "colors")),
    brand: read(raw, "brand")?.trim() || undefined,
    onSale: bool(read(raw, "onSale")),
    inStock: bool(read(raw, "inStock")),
    featured: bool(read(raw, "featured")),
    newArrival: bool(read(raw, "newArrival")),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as ProductSort) : undefined,
    page: page && page >= 1 ? Math.floor(page) : undefined,
  };
}

/** Filter state → query string without "?" (defaults and empty values omitted). */
export function serializeCatalogParams(p: CatalogParams): string {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.minPrice !== undefined) sp.set("minPrice", String(p.minPrice));
  if (p.maxPrice !== undefined) sp.set("maxPrice", String(p.maxPrice));
  if (p.sizes?.length) sp.set("sizes", p.sizes.join(","));
  if (p.colors?.length) sp.set("colors", p.colors.join(","));
  if (p.brand) sp.set("brand", p.brand);
  if (p.onSale) sp.set("onSale", "true");
  if (p.inStock) sp.set("inStock", "true");
  if (p.featured) sp.set("featured", "true");
  if (p.newArrival) sp.set("newArrival", "true");
  if (p.sort && p.sort !== DEFAULT_SORT) sp.set("sort", p.sort);
  if (p.page && p.page > 1) sp.set("page", String(p.page));
  return sp.toString();
}

/** Number of active filters (for the "Filters (3)" button); q / sort / page excluded. */
export function countActiveFilters(p: CatalogParams): number {
  return (
    (p.minPrice !== undefined || p.maxPrice !== undefined ? 1 : 0) +
    (p.sizes?.length ?? 0) +
    (p.colors?.length ?? 0) +
    (p.brand ? 1 : 0) +
    (p.onSale ? 1 : 0) +
    (p.inStock ? 1 : 0) +
    (p.featured ? 1 : 0) +
    (p.newArrival ? 1 : 0)
  );
}

/** The request for `GET /products` built from route + URL state. */
export function toProductQuery(p: CatalogParams, category?: string): ProductQuery {
  return { ...p, category, pageSize: CATALOG_PAGE_SIZE, sort: p.sort ?? DEFAULT_SORT };
}
