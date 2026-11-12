import type { Metadata } from "next";
import OrderSuccessClient from "./OrderSuccessClient";

export const metadata: Metadata = { title: "Payment received", robots: { index: false } };

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id } = await searchParams;
  return <OrderSuccessClient sessionId={typeof session_id === "string" ? session_id : null} />;
}
