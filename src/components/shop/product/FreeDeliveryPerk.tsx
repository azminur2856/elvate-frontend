"use client";

import { Truck } from "lucide-react";
import { formatBDT } from "@/lib/format";
import { useFeatureFlags } from "@/components/settings/FeatureFlagsProvider";

/**
 * First line of the product page's info box (FE-30): shown only while free
 * delivery is on. The page is server-rendered; the threshold comes from the
 * public settings in the browser.
 */
export function FreeDeliveryPerk() {
  const { shipping } = useFeatureFlags();
  if (!shipping || shipping.freeThreshold <= 0) return null;
  return (
    <li className="flex items-center gap-2 text-muted-foreground">
      <Truck aria-hidden="true" className="size-4 text-brand" />
      Free delivery on orders over {formatBDT(shipping.freeThreshold)}
    </li>
  );
}
