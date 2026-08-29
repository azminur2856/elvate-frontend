import type { Metadata } from "next";
import { StatusPage } from "@/components/shared/StatusPage";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StatusPage
      code={404}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
    />
  );
}
