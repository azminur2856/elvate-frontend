import type { Metadata } from "next";
import OrderDetailClient from "./OrderDetailClient";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string; payment?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  return (
    <OrderDetailClient id={id} placed={sp.placed === "1"} paymentCancelled={sp.payment === "cancelled"} />
  );
}
