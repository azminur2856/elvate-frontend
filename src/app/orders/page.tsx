import type { Metadata } from "next";
import { ALL_ORDER_STATUSES } from "@/lib/orders";
import type { OrderStatus } from "@/types/commerce";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = ALL_ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : null;
  const page = Math.max(1, Math.floor(Number(sp.page) || 1));
  return <OrdersClient initialStatus={status} initialPage={page} />;
}
