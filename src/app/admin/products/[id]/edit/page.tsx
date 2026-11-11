import type { Metadata } from "next";
import EditProductClient from "./EditProductClient";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  return <EditProductClient id={id} created={sp.created === "1"} />;
}
