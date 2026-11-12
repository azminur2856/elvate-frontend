import type { Metadata } from "next";
import FlashSalesClient from "./FlashSalesClient";

export const metadata: Metadata = { title: "Flash sales" };

export default function AdminFlashSalesPage() {
  return <FlashSalesClient />;
}
