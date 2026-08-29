import type { Metadata } from "next";
import { Shirt } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Men's collection" };

export default function MenPage() {
  return (
    <ComingSoon
      title="Men's collection coming soon"
      description="An exciting selection of products and offers tailored for men is on the way."
      icon={Shirt}
      backHref="/shop"
      backLabel="Back to shop"
    />
  );
}
