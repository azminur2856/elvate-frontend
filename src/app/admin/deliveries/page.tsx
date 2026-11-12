import type { Metadata } from "next";
import { isDeliveryView } from "@/lib/deliveries";
import DeliveriesClient from "./DeliveriesClient";

export const metadata: Metadata = { title: "Deliveries" };

/** ADMIN and STAFF (see STAFF_ADMIN_PATHS); `?view=` and `?day=today` come from the dashboard cards. */
export default async function AdminDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; day?: string }>;
}) {
  const { view, day } = await searchParams;
  return <DeliveriesClient initialView={isDeliveryView(view) ? view : "all"} initialToday={day === "today"} />;
}
