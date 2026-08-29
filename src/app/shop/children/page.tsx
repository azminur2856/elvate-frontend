import type { Metadata } from "next";
import { Baby } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Children's collection" };

export default function ChildrenPage() {
  return (
    <ComingSoon
      title="Children's collection coming soon"
      description="An exciting selection of products and offers for kids is on the way."
      icon={Baby}
      backHref="/shop"
      backLabel="Back to shop"
    />
  );
}
