import type { Metadata } from "next";
import NewProductClient from "./NewProductClient";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return <NewProductClient />;
}
