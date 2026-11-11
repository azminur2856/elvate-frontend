import type { MetadataRoute } from "next";
import type { Category } from "@/types/commerce";
import { getCategoryTree, getProducts } from "@/lib/catalog";
import { categoryHref, isRootCategory, productHref } from "@/lib/catalog-url";

const siteUrl =
  process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:3000";

// Only routes an anonymous crawler can actually load (the individual tools
// and /subscription redirect to /login — see middleware.ts).
const publicRoutes = [
  "",
  "/about",
  "/contact",
  "/terms",
  "/digitalServices",
  "/shop",
  "/shop/men",
  "/shop/women",
  "/shop/children",
  "/offers",
  "/login",
  "/signup",
];

/** Safety cap: 20 pages × 100 products. */
const MAX_PRODUCT_PAGES = 20;

// Rebuilt at most once an hour.
export const revalidate = 3600;

const flatten = (cats: Category[]): Category[] => cats.flatMap((c) => [c, ...flatten(c.children ?? [])]);

async function productEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
    const res = await getProducts({ page, pageSize: 100, sort: "newest" }, { revalidate: 3600 });
    if (!res.ok) break;
    for (const p of res.data.items) {
      entries.push({ url: `${siteUrl}${productHref(p.slug)}`, changeFrequency: "weekly", priority: 0.6 });
    }
    if (page >= res.data.totalPages) break;
  }
  return entries;
}

async function categoryEntries(): Promise<MetadataRoute.Sitemap> {
  const res = await getCategoryTree();
  if (!res.ok) return [];
  return flatten(res.data)
    .filter((c) => !isRootCategory(c.slug)) // roots are in publicRoutes
    .map((c) => ({ url: `${siteUrl}${categoryHref(c.slug)}`, changeFrequency: "weekly", priority: 0.6 }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
  // The API may be asleep: the sitemap then just lists the static pages.
  const [categories, products] = await Promise.all([categoryEntries(), productEntries()]);
  return [...staticEntries, ...categories, ...products];
}
