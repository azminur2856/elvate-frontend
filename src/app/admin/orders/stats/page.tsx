import type { Metadata } from "next";
import OrderStatsClient from "./OrderStatsClient";

export const metadata: Metadata = { title: "Order stats" };

export default function AdminOrderStatsPage() {
  return <OrderStatsClient />;
}
