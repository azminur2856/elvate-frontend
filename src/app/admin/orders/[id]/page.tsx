import type { Metadata } from "next";
import AdminOrderDetailClient from "./AdminOrderDetailClient";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminOrderDetailClient id={id} />;
}
