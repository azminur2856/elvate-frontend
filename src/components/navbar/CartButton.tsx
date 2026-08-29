"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

export function CartButton({ className }: { className?: string }) {
  const { count } = useCart();
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={className}
    >
      <Link
        href="/shop"
        aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
        className="relative"
      >
        <ShoppingCart aria-hidden="true" />
        {count > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 font-mono text-[10px] font-semibold leading-4 text-brand-foreground"
          >
            {count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
