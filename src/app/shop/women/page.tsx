import type { Metadata } from "next";
import { CatalogPage, type RawSearchParams } from "@/components/shop/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Women",
  description: "Dresses, tops, trousers and shoes for women. Shop online at Elvate with cash on delivery.",
};

export default async function WomenPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return <CatalogPage slug="women" searchParams={await searchParams} description="Dresses, tops, trousers and shoes for women." />;
}
