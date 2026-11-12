import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { Role } from "@/lib/enums/role.enum";
import AdminOrderDetailClient from "./AdminOrderDetailClient";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // The correction box is for ADMIN only (the server checks it too).
  const isAdmin = (await getSession())?.user?.role === Role.ADMIN;
  return <AdminOrderDetailClient id={id} isAdmin={isAdmin} />;
}
