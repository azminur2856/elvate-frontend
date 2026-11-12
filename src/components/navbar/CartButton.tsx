"use client";

import Link from "next/link";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { lineKey, useCart } from "@/components/cart/CartProvider";
import { CartLineItem, lineProblem } from "@/components/cart/CartLineItem";
import { EmptyState } from "@/components/shop/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { formatBDT } from "@/lib/format";
import { loginHref } from "@/lib/redirect";

/** Navbar cart: live count badge, opens the mini cart. */
export function CartButton({ className }: { className?: string }) {
  const { cart, count, ready, loggedIn, miniCartOpen, setMiniCartOpen } = useCart();
  const close = () => setMiniCartOpen(false);
  const blocked = cart.items.some((l) => lineProblem(l));
  const checkoutHref = loggedIn ? "/checkout" : loginHref("/checkout");

  return (
    <Sheet open={miniCartOpen} onOpenChange={setMiniCartOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className ? `relative ${className}` : "relative"}
          aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
        >
          <ShoppingCart aria-hidden="true" />
          {count > 0 ? (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 font-mono text-[10px] font-semibold leading-4 text-brand-foreground"
            >
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[min(26rem,100vw)] flex-col gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {count} {count === 1 ? "item" : "items"}
          </SheetDescription>
        </SheetHeader>

        {!ready ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner label="Loading your cart" />
          </div>
        ) : cart.items.length === 0 ? (
          <div className="flex flex-1 items-center p-4">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Find something you like in the shop."
              className="w-full border-none"
              action={
                <Button asChild onClick={close}>
                  <Link href="/shop">Start shopping</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-4">
              {cart.items.map((line) => (
                <li key={lineKey(line)}>
                  <CartLineItem line={line} compact onNavigate={close} />
                </li>
              ))}
            </ul>
            <SheetFooter className="gap-3 border-t">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">Subtotal</span>
                <span className="font-heading text-lg font-semibold tabular-nums">{formatBDT(cart.subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping and discounts are calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" onClick={close}>
                  <Link href="/cart">View cart</Link>
                </Button>
                {blocked ? (
                  <Button disabled>Checkout</Button>
                ) : (
                  <Button asChild onClick={close}>
                    <Link href={checkoutHref}>Checkout</Link>
                  </Button>
                )}
              </div>
              {blocked ? (
                <p className="text-xs text-destructive">Fix the highlighted items before checking out.</p>
              ) : null}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
