import type { Metadata } from "next";
import { CatalogPage, type RawSearchParams } from "@/components/shop/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Children",
  description: "Comfortable kidswear and shoes for boys and girls. Shop online at Elvate with cash on delivery.",
};

export default async function ChildrenPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return <CatalogPage slug="children" searchParams={await searchParams} description="Comfortable kidswear and shoes for boys and girls." />;
}
