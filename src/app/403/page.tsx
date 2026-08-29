import type { Metadata } from "next";
import { StatusPage } from "@/components/shared/StatusPage";

export const metadata: Metadata = { title: "Access denied" };

export default function ForbiddenPage() {
  return (
    <StatusPage
      code={403}
      title="Access denied"
      description="This area is for administrators only."
    />
  );
}
