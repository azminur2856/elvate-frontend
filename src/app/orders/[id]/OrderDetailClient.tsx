"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { ArrowLeft, CreditCard, MessageSquarePlus, Phone, Truck, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT } from "@/lib/format";
import { ORDER_STATUS_HINTS, PAYMENT_METHOD_LABELS } from "@/lib/orders";
import type { OrderDetail, OrderItem } from "@/types/commerce";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderBadges";
import { AddressLines, OrderItemsList, OrderTotals } from "@/components/orders/OrderParts";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { ReviewDialog } from "@/components/shop/reviews/ReviewDialog";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function OrderDetailClient({
  id,
  placed,
  paymentCancelled,
}: {
  id: string;
  placed: boolean;
  paymentCancelled: boolean;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notFound" | "error">("loading");
  const [error, setError] = useState("");

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    api
      .get<OrderDetail>(`/orders/${encodeURIComponent(id)}`)
      .then((res) => {
        if (cancelled) return;
        setOrder(res.data);
        setState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status === 404 || status === 403 || status === 400) setState("notFound");
        else {
          setError(getErrorMessage(err, "Could not load this order."));
          setState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const cancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await api.post<OrderDetail>(`/orders/${order.id}/cancel`, { reason: reason.trim() || undefined });
      setOrder(res.data);
      setCancelOpen(false);
      setReason("");
      toast.success(
        res.data.paymentStatus === "REFUNDED" ? "Order cancelled. Your refund is on its way." : "Order cancelled."
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not cancel the order."));
    } finally {
      setCancelling(false);
    }
  };

  const payNow = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const res = await api.post<{ checkoutUrl: string }>(`/orders/${order.id}/pay`);
      window.location.assign(res.data.checkoutUrl);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        // SEC-10: the last checkout was paid a moment ago (webhook still on its
        // way). Say so, then reload the order instead of opening a new checkout.
        toast(getErrorMessage(err, "This order has just been paid."));
        setTimeout(() => {
          api
            .get<OrderDetail>(`/orders/${encodeURIComponent(order.id)}`)
            .then((res) => setOrder(res.data))
            .catch(() => undefined)
            .finally(() => setPaying(false));
        }, 3000);
        return;
      }
      toast.error(getErrorMessage(err, "Could not start the payment."));
      setPaying(false);
    }
  };

  const back = (
    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 self-start">
      <Link href="/orders">
        <ArrowLeft aria-hidden="true" />
        My orders
      </Link>
    </Button>
  );

  if (state === "loading") {
    return (
      <PageShell width="xl">
        {back}
        <div role="status" aria-label="Loading order" className="grid gap-6">
          <Skeleton className="h-10 w-72" />
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="grid gap-6">
              <Skeleton className="h-56 rounded-xl" />
              <Skeleton className="h-72 rounded-xl" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (state !== "ready" || !order) {
    return (
      <PageShell width="md">
        {back}
        <FormMessage variant="error" title={state === "notFound" ? "Order not found" : "Something went wrong"}>
          {state === "notFound" ? "This order doesn't exist or belongs to another account." : error}
        </FormMessage>
      </PageShell>
    );
  }

  const showDeliveryMan =
    order.deliveryMan && (order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY");

  return (
    <PageShell width="xl">
      {back}

      <div className="mb-6 grid gap-3">
        {placed && order.status !== "CANCELLED" ? (
          <FormMessage variant="success" title="Thank you! Your order has been placed">
            {order.paymentMethod === "COD"
              ? `Please keep ${formatBDT(order.total)} ready in cash for the delivery man. We'll e-mail you updates.`
              : "We'll e-mail you updates as your order moves along."}
          </FormMessage>
        ) : null}
        {paymentCancelled && order.canPay ? (
          <FormMessage variant="info" title="Payment cancelled">
            Your card was not charged. Unpaid card orders are cancelled automatically after about 30 minutes, so pay now to
            keep it.
          </FormMessage>
        ) : null}
      </div>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order <span className="font-mono">{order.orderNumber}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Placed <LocalTime value={order.createdAt} mode="datetime" />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress</CardTitle>
              <p className="text-sm text-muted-foreground">{ORDER_STATUS_HINTS[order.status]}</p>
            </CardHeader>
            <CardContent>
              <OrderTimeline status={order.status} history={order.statusHistory} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Items <span className="font-normal text-muted-foreground">({order.itemCount})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderItemsList
                items={order.items}
                action={(item) =>
                  item.canReview && item.productId ? (
                    <Button variant="outline" size="sm" onClick={() => setReviewItem(item)}>
                      <MessageSquarePlus aria-hidden="true" />
                      Review<span className="sr-only"> {item.productName}</span>
                    </Button>
                  ) : null
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:sticky lg:top-[calc(var(--navbar-h)+1.5rem)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <OrderTotals
                subtotal={order.subtotal}
                discount={order.discount}
                shippingFee={order.shippingFee}
                total={order.total}
                couponCode={order.couponCode}
              />
              <div className="grid gap-1 text-sm">
                <p className="text-muted-foreground">Payment</p>
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                  <PaymentStatusBadge status={order.paymentStatus} />
                </p>
              </div>
              {order.canPay ? (
                <Button onClick={payNow} loading={paying} className="w-full">
                  {paying ? null : <CreditCard aria-hidden="true" />}
                  Pay {formatBDT(order.total)} now
                </Button>
              ) : null}
              {order.canCancel ? (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => setCancelOpen(true)}
                >
                  <XCircle aria-hidden="true" />
                  Cancel order
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {showDeliveryMan && order.deliveryMan ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck aria-hidden="true" className="size-5 text-brand" />
                  Your delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <p>
                  <span className="font-medium">{order.deliveryMan.name}</span> is delivering your order.
                </p>
                {order.deliveryMan.phone ? (
                  <Button asChild variant="outline" size="sm" className="justify-self-start">
                    <a href={`tel:${order.deliveryMan.phone}`}>
                      <Phone aria-hidden="true" />
                      Call {order.deliveryMan.phone}
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <AddressLines address={order.shippingAddress} />
              {order.notes ? (
                <div className="text-sm">
                  <p className="text-muted-foreground">Your notes</p>
                  <p className="whitespace-pre-line">{order.notes}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(o) => !cancelling && setCancelOpen(o)}
        title="Cancel this order?"
        description={
          order.paymentStatus === "PAID"
            ? "The items go back on sale and your card payment is refunded to the same card (this can take a few days)."
            : "The items go back on sale. This can't be undone."
        }
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        loading={cancelling}
        onConfirm={cancelOrder}
      >
        <FormField id="cancel-reason" label="Reason (optional)">
          <Textarea rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
        </FormField>
      </ConfirmDialog>

      {reviewItem?.productId ? (
        <ReviewDialog
          productId={reviewItem.productId}
          productName={reviewItem.productName}
          open
          onOpenChange={(o) => !o && setReviewItem(null)}
          onSubmitted={() =>
            setOrder((o) =>
              o
                ? {
                    ...o,
                    items: o.items.map((it) => (it.productId === reviewItem.productId ? { ...it, canReview: false } : it)),
                  }
                : o
            )
          }
        />
      ) : null}
    </PageShell>
  );
}
