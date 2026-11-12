"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";

/**
 * Shown when the catalog API cannot be reached. The free Render backend
 * sleeps when idle and needs ~30–60 s to wake up, so "try again" usually works.
 */
export function ShopUnavailable({
  title = "The shop is waking up",
  className,
}: {
  title?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <EmptyState
      icon={CloudOff}
      title={title}
      description="We couldn't load products right now. This usually takes less than a minute, so please try again shortly."
      className={className}
      action={
        <Button onClick={() => startTransition(() => router.refresh())} loading={pending}>
          {pending ? null : <RotateCw aria-hidden="true" />}
          Try again
        </Button>
      }
    />
  );
}
