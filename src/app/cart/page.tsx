import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return <CartClient />;
}
