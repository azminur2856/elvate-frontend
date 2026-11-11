import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getCategory } from "@/lib/catalog";
import { isRootCategory } from "@/lib/catalog-url";
import { CatalogPage, type RawSearchParams } from "@/components/shop/catalog/CatalogPage";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getCategory(slug);
  if (!res.ok) return { title: "Shop" };
  const crumbs = res.data.breadcrumb?.map((b) => b.name) ?? [];
  const audience = crumbs.length > 1 ? ` for ${crumbs[0].toLowerCase()}` : "";
  return {
    title: crumbs.length > 1 ? `${res.data.name} · ${crumbs[0]}` : res.data.name,
    description: `Shop ${res.data.name.toLowerCase()}${audience} at Elvate. New arrivals, sale prices and cash on delivery.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  // Root categories have their own URL (/shop/men …).
  if (isRootCategory(slug)) {
    const qs = new URLSearchParams(
      Object.entries(sp).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : v ? [[k, v]] : []))
    ).toString();
    permanentRedirect(`/shop/${slug}${qs ? `?${qs}` : ""}`);
  }
  return <CatalogPage slug={slug} searchParams={sp} />;
}
