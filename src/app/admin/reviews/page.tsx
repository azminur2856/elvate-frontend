import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Reviews" };

export default function AdminReviewsPage() {
  return (
    <ComingSoon
      title="Reviews"
      description="Review moderation is under development."
      icon={MessageSquareText}
      badge="Under development"
      backHref="/admin/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
