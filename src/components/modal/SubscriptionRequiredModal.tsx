"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  message?: string;
  onClose: () => void;
};

export default function SubscriptionRequiredModal({
  open,
  message,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-muted text-brand">
            <Lock aria-hidden="true" className="size-6" />
          </span>
          <DialogTitle>Subscription required</DialogTitle>
          <DialogDescription>
            {message || "You need an active subscription to use this feature."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button asChild>
            <Link href="/subscription">View subscription plans</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
