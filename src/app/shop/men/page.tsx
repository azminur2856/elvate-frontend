import type { Metadata } from "next";
import { CatalogPage, type RawSearchParams } from "@/components/shop/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Men",
  description: "Shirts, T-shirts, trousers and shoes for men. Shop online at Elvate with cash on delivery.",
};

export default async function MenPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return <CatalogPage slug="men" searchParams={await searchParams} description="Shirts, T-shirts, trousers and shoes for men." />;
}
