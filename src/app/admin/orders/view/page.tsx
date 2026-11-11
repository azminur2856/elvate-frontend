import type { Metadata } from "next";
import { ALL_ORDER_STATUSES } from "@/lib/orders";
import type { OrderStatus } from "@/types/commerce";
import AdminOrdersClient from "./AdminOrdersClient";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const initial = ALL_ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : null;
  return <AdminOrdersClient initialStatus={initial} />;
}
