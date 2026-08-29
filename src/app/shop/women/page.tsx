import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Women's collection" };

export default function WomenPage() {
  return (
    <ComingSoon
      title="Women's collection coming soon"
      description="An exciting selection of products and offers tailored for women is on the way."
      icon={Sparkles}
      backHref="/shop"
      backLabel="Back to shop"
    />
  );
}
