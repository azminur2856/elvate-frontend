import type { Metadata } from "next";
import { parseCatalogParams } from "@/lib/catalog-url";
import { CatalogPage, searchTitle, type RawSearchParams } from "@/components/shop/catalog/CatalogPage";

type Props = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = parseCatalogParams(await searchParams);
  return {
    title: params.q ? `Search: ${params.q}` : searchTitle(params),
    // Result pages for arbitrary queries should not be indexed.
    robots: params.q ? { index: false, follow: true } : undefined,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  return <CatalogPage searchParams={await searchParams} />;
}
