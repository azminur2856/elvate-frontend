"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import { AlertTriangle, Banknote, CreditCard, Lock, TicketPercent, X } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Address, CartLine, PaymentMethod, PlaceOrderConflict, PlaceOrderResponse, Quote } from "@/types/commerce";
import { AddressBook } from "@/components/address/AddressBook";
import { useCart } from "@/components/cart/CartProvider";
import { variantLabel } from "@/components/cart/CartLineItem";
import { OrderTotals } from "@/components/orders/OrderParts";
import { PageShell } from "@/components/shared/PageShell";
import { ProductImage } from "@/components/shop/ProductImage";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const METHODS: { value: PaymentMethod; title: string; text: string; icon: typeof Banknote }[] = [
  { value: "COD", title: "Cash on delivery", text: "Pay the delivery man in cash when the parcel arrives.", icon: Banknote },
  { value: "STRIPE", title: "Card", text: "Pay securely by card on the next page (Stripe).", icon: CreditCard },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="rounded-xl border bg-card p-4 sm:p-6">
      <h2 id={`step-${n}`} className="mb-4 flex items-center gap-3 text-lg font-semibold">
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground"
        >
          {n}
        </span>
        <span>
          <span className="sr-only">Step {n}: </span>
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
}

export default function CheckoutClient() {
  const router = useRouter();
  const { cart, ready, refresh } = useCart();
  const [address, setAddress] = useState<Address | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("COD");
  const [notes, setNotes] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{ valid: boolean; message: string } | null>(null);
  const [applying, setApplying] = useState(false);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const [placing, setPlacing] = useState(false);
  // `unsure`: a server error or no answer, so the order may still have been saved.
  const [placeError, setPlaceError] = useState<{ message: string; lines: CartLine[]; unsure?: boolean } | null>(null);
  const placed = useRef(false);
  // Set after a server error while placing (see `placeError.unsure`).
  const unsure = useRef(false);
  const quoteSeq = useRef(0);

  // Nothing to check out. After a server error an empty cart means the order was saved.
  useEffect(() => {
    if (!ready || cart.items.length > 0 || placed.current) return;
    if (unsure.current) {
      toast("Your order most likely went through. Please check it here.");
      router.replace("/orders");
    } else {
      router.replace("/cart");
    }
  }, [ready, cart.items.length, router]);

  const requestQuote = useCallback(async (addressId: string | undefined, couponCode: string | null) => {
    const my = ++quoteSeq.current;
    setQuoting(true);
    setQuoteError("");
    try {
      const res = await api.post<Quote>("/orders/quote", {
        addressId,
        couponCode: couponCode ?? undefined,
      });
      if (my === quoteSeq.current) setQuote(res.data);
      return res.data;
    } catch (err) {
      if (my === quoteSeq.current) setQuoteError(getErrorMessage(err, "Could not price your order."));
      return null;
    } finally {
      if (my === quoteSeq.current) setQuoting(false);
    }
  }, []);

  // Re-quote when the address or the cart changes (coupon changes quote explicitly).
  const couponRef = useRef(coupon);
  couponRef.current = coupon;
  useEffect(() => {
    if (!ready || cart.items.length === 0 || placed.current) return;
    void requestQuote(address?.id, couponRef.current);
  }, [address?.id, ready, cart.itemCount, cart.subtotal, cart.items.length, requestQuote]);

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    const q = await requestQuote(address?.id, code);
    setApplying(false);
    if (!q) return;
    if (q.coupon?.valid) {
      setCoupon(code);
      setCouponInput("");
      setCouponFeedback({ valid: true, message: q.coupon.message || `${code} applied.` });
    } else {
      setCoupon(null);
      setCouponFeedback({ valid: false, message: q.coupon?.message || "This code can't be used." });
      // Price without the rejected code.
      void requestQuote(address?.id, null);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponFeedback(null);
    void requestQuote(address?.id, null);
  };

  const unavailable = (quote?.items ?? []).filter((l) => !l.available);
  // A failed re-quote leaves the previous price on screen (e.g. the old
  // delivery fee after switching address), so don't place until it works.
  const canPlace = Boolean(
    address && quote && !quoting && !quoteError && unavailable.length === 0 && !placing
  );

  const placeOrder = async () => {
    if (!address || !canPlace) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const res = await api.post<PlaceOrderResponse>("/orders", {
        addressId: address.id,
        paymentMethod: method,
        couponCode: coupon ?? undefined,
        notes: notes.trim() || undefined,
      });
      placed.current = true;
      if (method === "STRIPE" && res.data.checkoutUrl) {
        window.location.assign(res.data.checkoutUrl);
        return;
      }
      await refresh();
      router.push(`/orders/${res.data.order.id}?placed=1`);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        // Stock changed since the quote. The 409 lists `{ variantId, available }`;
        // name those lines, then re-price the cart.
        const conflict = (err.response.data as Partial<PlaceOrderConflict> | undefined)?.items ?? [];
        const before = quote?.items ?? cart.items;
        await refresh();
        const q = await requestQuote(address.id, coupon);
        const fromBody = conflict
          .map((c) => {
            const line = before.find((l) => l.variantId === c.variantId);
            return line ? { ...line, stock: c.available, available: false } : null;
          })
          .filter((l): l is CartLine => l !== null);
        setPlaceError({
          message: getErrorMessage(err, "Some items in your cart changed while you were checking out."),
          lines: fromBody.length ? fromBody : (q?.items ?? []).filter((l) => !l.available),
        });
      } else if (!isAxiosError(err) || !err.response || err.response.status >= 500) {
        // The order may have been saved before the error: re-read the cart and point to My orders.
        unsure.current = true;
        await refresh();
        setPlaceError({
          message: "Something went wrong on our side. Your order may still have gone through, so please check My orders before you try again.",
          lines: [],
          unsure: true,
        });
      } else {
        setPlaceError({ message: getErrorMessage(err, "Could not place your order. Please try again."), lines: [] });
      }
      setPlacing(false);
    }
  };

  if (!ready || cart.items.length === 0) {
    return (
      <PageShell width="xl" title="Checkout">
        <div role="status" aria-label="Loading checkout" className="grid gap-6 lg:grid-cols-[1fr_24rem]">
          <div className="grid gap-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </PageShell>
    );
  }

  const items = quote?.items ?? cart.items;
  const threshold = quote?.freeShippingThreshold ?? null;
  // The backend compares `subtotal − discount` with the threshold.
  const missingForFree =
    threshold !== null && quote ? Math.max(0, threshold - (quote.subtotal - quote.discount)) : 0;

  return (
    <PageShell width="xl" title="Checkout">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-6">
          <Step n={1} title="Delivery address">
            <AddressBook
              mode="select"
              selectedId={address?.id ?? null}
              onSelect={setAddress}
              onChange={(list) => {
                // Pick the default (or first) address once, and recover if the chosen one was deleted.
                setAddress((current) =>
                  current && list.some((a) => a.id === current.id)
                    ? (list.find((a) => a.id === current.id) ?? current)
                    : (list.find((a) => a.isDefault) ?? list[0] ?? null)
                );
              }}
            />
          </Step>

          <Step n={2} title="Payment method">
            <fieldset>
              <legend className="sr-only">Payment method</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {METHODS.map(({ value, title, text, icon: Icon }) => {
                  const checked = method === value;
                  return (
                    <label
                      key={value}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                        checked ? "border-primary ring-1 ring-primary" : "hover:border-input"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={value}
                        checked={checked}
                        onChange={() => setMethod(value)}
                        className="mt-1 size-4 accent-primary"
                      />
                      <span className="grid gap-1">
                        <span className="flex items-center gap-2 font-medium">
                          <Icon aria-hidden="true" className="size-4 text-brand" />
                          {title}
                        </span>
                        <span className="text-sm text-muted-foreground">{text}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </Step>

          <Step n={3} title="Review your items">
            <ul className="divide-y">
              {items.map((l) => (
                <li key={l.variantId} className="flex gap-3 py-3 first:pt-0">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border">
                    <ProductImage src={l.image} alt="" sizes="56px" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {[variantLabel(l), `Qty ${l.quantity}`].filter(Boolean).join(" · ")}
                    </p>
                    {!l.available ? (
                      <p className="text-sm text-destructive">
                        {l.stock > 0 ? `Only ${l.stock} left` : "Out of stock"}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-medium tabular-nums">{formatBDT(l.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <Button asChild variant="link" className="mt-2 h-auto px-0 text-link">
              <Link href="/cart">Edit cart</Link>
            </Button>
            <FormField
              id="order-notes"
              label="Delivery notes (optional)"
              hint="For example a landmark or the best time to call."
              className="mt-4"
            >
              <Textarea rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </FormField>
          </Step>
        </div>

        <Card className="lg:sticky lg:top-[calc(var(--navbar-h)+1.5rem)]">
          <CardHeader>
            <CardTitle className="text-lg">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              {coupon ? (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-success">
                    <TicketPercent aria-hidden="true" className="size-4" />
                    {coupon}
                  </span>
                  <Button variant="ghost" size="icon-sm" onClick={removeCoupon} aria-label={`Remove coupon ${coupon}`}>
                    <X aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <form onSubmit={applyCoupon} className="flex gap-2">
                  <Input
                    aria-label="Coupon code"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      if (couponFeedback && !couponFeedback.valid) setCouponFeedback(null);
                    }}
                    className="uppercase placeholder:normal-case"
                    maxLength={40}
                    aria-describedby="coupon-feedback"
                    aria-invalid={couponFeedback && !couponFeedback.valid ? true : undefined}
                  />
                  <Button type="submit" variant="outline" loading={applying} disabled={!couponInput.trim()}>
                    Apply
                  </Button>
                </form>
              )}
              <p
                id="coupon-feedback"
                aria-live="polite"
                className={cn("text-sm", couponFeedback?.valid ? "text-success" : "text-destructive")}
              >
                {couponFeedback?.message ?? ""}
              </p>
            </div>

            {quoteError ? (
              <div className="grid gap-2">
                <FormMessage variant="error">{quoteError}</FormMessage>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-self-start"
                  loading={quoting}
                  onClick={() => void requestQuote(address?.id, coupon)}
                >
                  Try again
                </Button>
              </div>
            ) : null}

            {quote ? (
              <div
                aria-busy={quoting}
                className={cn("transition-opacity", (quoting || quoteError) && "opacity-60")}
              >
                <OrderTotals
                  subtotal={quote.subtotal}
                  discount={quote.discount}
                  shippingFee={quote.shippingFee}
                  total={quote.total}
                  couponCode={quote.coupon?.valid ? quote.coupon.code : null}
                />
                {!address ? (
                  <p className="mt-2 text-xs text-muted-foreground">Choose an address to see the delivery fee.</p>
                ) : missingForFree > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Add {formatBDT(missingForFree)} more to get free delivery.
                  </p>
                ) : threshold !== null && quote.shippingFee === 0 ? (
                  <p className="mt-2 text-xs text-success">You get free delivery.</p>
                ) : null}
              </div>
            ) : (
              <div role="status" aria-label="Calculating totals" className="grid gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-7 w-full" />
              </div>
            )}

            {unavailable.length > 0 && !placeError ? (
              <FormMessage variant="error" title="Some items are no longer available">
                Update your cart to continue.{" "}
                <Link href="/cart" className="underline">
                  Back to cart
                </Link>
              </FormMessage>
            ) : null}

            {placeError ? (
              <FormMessage variant="error" title={placeError.unsure ? "We couldn't confirm your order" : "Your order wasn't placed"}>
                <p>{placeError.message}</p>
                {placeError.lines.length ? (
                  <ul className="mt-2 list-disc pl-5">
                    {placeError.lines.map((l) => (
                      <li key={l.variantId}>
                        {l.name}
                        {variantLabel(l) ? ` (${variantLabel(l)})` : ""}:{" "}
                        {l.stock > 0 ? `only ${l.stock} left` : "out of stock"}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {placeError.unsure ? (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href="/orders">Check My orders</Link>
                  </Button>
                ) : null}
                {placeError.lines.length ? (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href="/cart">
                      <AlertTriangle aria-hidden="true" />
                      Review your cart
                    </Link>
                  </Button>
                ) : null}
              </FormMessage>
            ) : null}

            <Button size="lg" className="w-full" onClick={placeOrder} disabled={!canPlace} loading={placing}>
              {placing ? null : <Lock aria-hidden="true" />}
              {method === "STRIPE" ? "Continue to payment" : "Place order"}
              {quote && !placing ? ` · ${formatBDT(quote.total)}` : ""}
            </Button>
            {!address ? (
              <p className="-mt-2 text-center text-xs text-muted-foreground">Add or choose a delivery address first.</p>
            ) : null}
            <p className="text-center text-xs text-muted-foreground">
              By placing your order you agree to our{" "}
              <Link href="/terms" className="underline">
                terms
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
