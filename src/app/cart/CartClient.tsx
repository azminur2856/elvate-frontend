"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ShoppingBag } from "lucide-react";
import { lineKey, useCart } from "@/components/cart/CartProvider";
import { CartLineItem, lineProblem } from "@/components/cart/CartLineItem";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState } from "@/components/shop/EmptyState";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/lib/format";
import { loginHref } from "@/lib/redirect";

export default function CartClient() {
  const { cart, ready, loggedIn } = useCart();
  const problems = cart.items.filter((l) => lineProblem(l)).length;
  const checkoutHref = loggedIn ? "/checkout" : loginHref("/checkout");

  if (!ready) {
    return (
      <PageShell width="xl" title="Your cart">
        <div role="status" aria-label="Loading your cart" className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="grid gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </PageShell>
    );
  }

  if (cart.items.length === 0) {
    return (
      <PageShell width="lg" title="Your cart">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the collections and add something you like."
          action={
            <Button asChild>
              <Link href="/shop">Start shopping</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      width="xl"
      title="Your cart"
      description={`${cart.itemCount} ${cart.itemCount === 1 ? "item" : "items"}`}
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Items in your cart" className="grid gap-4">
          {problems > 0 ? (
            <FormMessage variant="error" title="Some items need your attention">
              {problems === 1 ? "One item is" : `${problems} items are`} out of stock or over the available quantity.
              Update or remove {problems === 1 ? "it" : "them"} to check out.
            </FormMessage>
          ) : null}
          <ul className="divide-y rounded-xl border bg-card px-4 sm:px-6">
            {cart.items.map((line) => (
              <li key={lineKey(line)}>
                <CartLineItem line={line} />
              </li>
            ))}
          </ul>
          <Button asChild variant="link" className="justify-self-start px-0 text-link">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </section>

        <Card className="lg:sticky lg:top-[calc(var(--navbar-h)+1.5rem)]">
          <CardHeader>
            <CardTitle className="text-lg">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium tabular-nums">{formatBDT(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-muted-foreground">At checkout</dd>
              </div>
            </dl>
            <div className="flex items-baseline justify-between border-t pt-4">
              <span className="font-semibold">Estimated total</span>
              <span className="font-heading text-xl font-bold tabular-nums">{formatBDT(cart.subtotal)}</span>
            </div>
            {problems > 0 ? (
              <Button disabled className="w-full">
                <AlertTriangle aria-hidden="true" />
                Fix items to continue
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link href={checkoutHref}>
                  {loggedIn ? "Proceed to checkout" : "Log in to check out"}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            )}
            <p className="text-center text-xs text-muted-foreground">Coupons and delivery fees are applied at checkout.</p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
