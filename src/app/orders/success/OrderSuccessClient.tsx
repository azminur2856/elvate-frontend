"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import api from "@/lib/authAxios";
import type { OrderSessionStatus } from "@/types/commerce";
import { useCart } from "@/components/cart/CartProvider";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const POLL_MS = 1500;
const MAX_WAIT_MS = 10_000;

/**
 * Stripe sends the customer here after paying. The webhook may arrive a few
 * seconds later, so poll `/orders/session/:id` until the order is PAID
 * (at most ~10 s), then link to the order.
 */
export default function OrderSuccessClient({ sessionId }: { sessionId: string | null }) {
  const { refresh } = useCart();
  const [status, setStatus] = useState<OrderSessionStatus | null>(null);
  const [phase, setPhase] = useState<"checking" | "paid" | "pending" | "error">(sessionId ? "checking" : "error");

  useEffect(() => {
    // Placing the order emptied the server cart.
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let timer: number | undefined;
    const started = Date.now();

    const poll = async () => {
      try {
        const res = await api.get<OrderSessionStatus>(`/orders/session/${encodeURIComponent(sessionId)}`);
        if (cancelled) return;
        setStatus(res.data);
        if (res.data.paymentStatus === "PAID") {
          setPhase("paid");
          return;
        }
      } catch {
        if (cancelled) return;
      }
      if (Date.now() - started >= MAX_WAIT_MS) {
        setPhase((p) => (p === "paid" ? p : "pending"));
        return;
      }
      timer = window.setTimeout(poll, POLL_MS);
    };
    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [sessionId]);

  const orderHref = status ? `/orders/${status.orderId}` : "/orders";

  return (
    <PageShell width="sm" center>
      <Card className="w-full text-center">
        <CardContent className="grid justify-items-center gap-4 pt-6" aria-live="polite">
          {phase === "checking" ? (
            <>
              <Spinner size="lg" label="Confirming your payment" />
              <h1 className="text-2xl font-bold">Confirming your payment…</h1>
              <p className="text-muted-foreground">This only takes a few seconds. Please don&apos;t close this page.</p>
            </>
          ) : phase === "paid" ? (
            <>
              <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 aria-hidden="true" className="size-8" />
              </span>
              <h1 className="text-2xl font-bold">Thank you! Payment received</h1>
              <p className="text-muted-foreground">
                Order <span className="font-mono font-medium text-foreground">{status?.orderNumber}</span> is paid and
                confirmed. We&apos;ll e-mail you when it ships.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link href={orderHref}>View order</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/shop">Keep shopping</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <span className="flex size-14 items-center justify-center rounded-full bg-warning/15 text-warning">
                <Clock aria-hidden="true" className="size-8" />
              </span>
              <h1 className="text-2xl font-bold">We&apos;re still confirming your payment</h1>
              <p className="text-muted-foreground">
                {sessionId
                  ? "Stripe can take a minute to confirm. Your order will show as paid as soon as it does; you won't be charged twice."
                  : "We couldn't find a payment session in this link."}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link href={orderHref}>{status ? "View order" : "My orders"}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/shop">Keep shopping</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
