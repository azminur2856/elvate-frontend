"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { ArrowLeft, Mail, Phone, Save, Truck, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/orders";
import type { DeliveryManOption, OrderDetail, OrderStatus } from "@/types/commerce";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderBadges";
import { AddressLines, OrderItemsList, OrderTotals } from "@/components/orders/OrderParts";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

/** Button text for moving an order into a status. */
const ACTION_LABELS: Record<OrderStatus, string> = {
  PENDING: "Back to pending",
  CONFIRMED: "Confirm order",
  PROCESSING: "Start packing",
  SHIPPED: "Mark as shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Mark delivered",
  CANCELLED: "Cancel order",
  RETURN_REQUESTED: "Request return",
  RETURNED: "Mark returned",
};
const DESTRUCTIVE: OrderStatus[] = ["CANCELLED", "RETURNED"];

export default function AdminOrderDetailClient({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notFound" | "error">("loading");
  const [error, setError] = useState("");

  const [nextStatus, setNextStatus] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const [changing, setChanging] = useState(false);

  const [deliveryMen, setDeliveryMen] = useState<DeliveryManOption[] | null>(null);
  const [deliveryManId, setDeliveryManId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const apply = (o: OrderDetail) => {
    setOrder(o);
    setAdminNotes(o.adminNotes ?? "");
    setDeliveryManId(o.deliveryMan?.id ?? "");
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get<OrderDetail>(`/orders/${encodeURIComponent(id)}`)
      .then((res) => {
        if (cancelled) return;
        apply(res.data);
        setState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status === 404 || status === 400) setState("notFound");
        else {
          setError(getErrorMessage(err, "Could not load the order."));
          setState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const canAssign = order?.status === "PROCESSING" || order?.status === "SHIPPED";
  useEffect(() => {
    if (!canAssign || deliveryMen) return;
    api
      .get<DeliveryManOption[]>("/admin/orders/delivery-men")
      .then((res) => setDeliveryMen(res.data))
      .catch((err) => {
        setDeliveryMen([]);
        toast.error(getErrorMessage(err, "Could not load delivery men."));
      });
  }, [canAssign, deliveryMen]);

  const changeStatus = async () => {
    if (!order || !nextStatus) return;
    setChanging(true);
    try {
      const res = await api.patch<OrderDetail>(`/admin/orders/${order.id}/status`, {
        status: nextStatus,
        note: note.trim() || undefined,
      });
      apply(res.data);
      toast.success(`Order is now ${ORDER_STATUS_LABELS[res.data.status].toLowerCase()}.`);
      setNextStatus(null);
      setNote("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    } finally {
      setChanging(false);
    }
  };

  const assign = async () => {
    if (!order || !deliveryManId) return;
    setAssigning(true);
    try {
      const res = await api.patch<OrderDetail>(`/admin/orders/${order.id}/assign`, { deliveryManId });
      apply(res.data);
      setDeliveryMen(null); // refresh the load counts
      toast.success(`Assigned to ${res.data.deliveryMan?.name ?? "the delivery man"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not assign the delivery man."));
    } finally {
      setAssigning(false);
    }
  };

  const saveNotes = async () => {
    if (!order) return;
    setSavingNotes(true);
    try {
      const res = await api.patch<OrderDetail>(`/admin/orders/${order.id}/notes`, { adminNotes: adminNotes.trim() });
      apply(res.data);
      toast.success("Notes saved.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the notes."));
    } finally {
      setSavingNotes(false);
    }
  };

  const back = (
    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 self-start">
      <Link href="/admin/orders/view">
        <ArrowLeft aria-hidden="true" />
        Orders
      </Link>
    </Button>
  );

  if (state === "loading") {
    return (
      <PageShell width="xl">
        {back}
        <div role="status" aria-label="Loading order" className="grid gap-6">
          <Skeleton className="h-10 w-72" />
          <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
            <Skeleton className="h-96 rounded-xl" />
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
          {state === "notFound" ? "There is no order with this id." : error}
        </FormMessage>
      </PageShell>
    );
  }

  const notesDirty = adminNotes.trim() !== (order.adminNotes ?? "").trim();

  return (
    <PageShell width="xl">
      {back}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order <span className="font-mono">{order.orderNumber}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Placed <LocalTime value={order.createdAt} mode="datetime" /> · {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Next step</CardTitle>
          <CardDescription>
            {order.allowedNextStatuses.length
              ? "Move the order forward. You can add a note that appears in the timeline."
              : "This order is finished; no further status changes are possible."}
          </CardDescription>
        </CardHeader>
        {order.allowedNextStatuses.length ? (
          <CardContent className="flex flex-wrap gap-2">
            {order.allowedNextStatuses.map((s) => (
              <Button
                key={s}
                variant={DESTRUCTIVE.includes(s) ? "outline" : "default"}
                className={DESTRUCTIVE.includes(s) ? "text-destructive hover:text-destructive" : undefined}
                onClick={() => setNextStatus(s)}
              >
                {ACTION_LABELS[s]}
              </Button>
            ))}
          </CardContent>
        ) : null}
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Items <span className="font-normal text-muted-foreground">({order.itemCount})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <OrderItemsList items={order.items} />
              <OrderTotals
                subtotal={order.subtotal}
                discount={order.discount}
                shippingFee={order.shippingFee}
                total={order.total}
                couponCode={order.couponCode}
                className="border-t pt-4"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline status={order.status} history={order.statusHistory} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserRound aria-hidden="true" className="size-5 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2 text-link hover:underline">
                <Mail aria-hidden="true" className="size-4" />
                {order.customer.email}
              </a>
              {order.customer.phone ? (
                <a href={`tel:${order.customer.phone}`} className="flex items-center gap-2 text-link hover:underline">
                  <Phone aria-hidden="true" className="size-4" />
                  {order.customer.phone}
                </a>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ship to</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <AddressLines address={order.shippingAddress} />
              <p className="text-xs text-muted-foreground">
                {order.shippingAddress.isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka"}
              </p>
              {order.notes ? (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="font-medium">Customer note</p>
                  <p className="whitespace-pre-line">{order.notes}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck aria-hidden="true" className="size-5 text-muted-foreground" />
                Delivery
              </CardTitle>
              <CardDescription>
                {order.deliveryMan
                  ? `Assigned to ${order.deliveryMan.name}${order.deliveryMan.phone ? ` (${order.deliveryMan.phone})` : ""}.`
                  : "No delivery man assigned yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {canAssign ? (
                <>
                  <div className="grid gap-1.5">
                    <Label htmlFor="delivery-man">{order.deliveryMan ? "Reassign to" : "Assign to"}</Label>
                    <Select value={deliveryManId} onValueChange={setDeliveryManId} disabled={!deliveryMen}>
                      <SelectTrigger id="delivery-man" className="w-full">
                        <SelectValue placeholder={deliveryMen ? "Choose a delivery man" : "Loading…"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(deliveryMen ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} · {d.activeOrders} active
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {deliveryMen && deliveryMen.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No delivery men yet. Give a user the Delivery man role under Users → Manage.
                      </p>
                    ) : null}
                  </div>
                  <Button
                    onClick={assign}
                    loading={assigning}
                    disabled={!deliveryManId || deliveryManId === order.deliveryMan?.id}
                    className="justify-self-start"
                  >
                    {order.deliveryMan ? "Reassign" : "Assign"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  A delivery man can be assigned while the order is being packed or has shipped.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Internal notes</CardTitle>
              <CardDescription>Only staff and admins see these.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Textarea
                aria-label="Internal notes"
                rows={4}
                maxLength={1000}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <Button variant="outline" className="justify-self-start" onClick={saveNotes} loading={savingNotes} disabled={!notesDirty}>
                {savingNotes ? null : <Save aria-hidden="true" />}
                Save notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={nextStatus !== null}
        onOpenChange={(o) => {
          if (!o && !changing) {
            setNextStatus(null);
            setNote("");
          }
        }}
        title={nextStatus ? `${ACTION_LABELS[nextStatus]}?` : ""}
        description={
          nextStatus === "CANCELLED"
            ? "Stock goes back on sale and the coupon use is released. Paid card orders are refunded."
            : nextStatus === "RETURNED"
              ? "Stock goes back on sale and the coupon use is released."
              : nextStatus === "DELIVERED" && order.paymentMethod === "COD"
                ? "The cash on delivery payment is marked as received."
                : `The order moves to “${nextStatus ? ORDER_STATUS_LABELS[nextStatus] : ""}”. The customer sees this in their timeline.`
        }
        confirmLabel={nextStatus ? ACTION_LABELS[nextStatus] : "Confirm"}
        destructive={nextStatus ? DESTRUCTIVE.includes(nextStatus) : false}
        loading={changing}
        onConfirm={changeStatus}
      >
        <FormField
          id="status-note"
          label={nextStatus && DESTRUCTIVE.includes(nextStatus) ? "Reason (shown in the timeline)" : "Note (optional)"}
        >
          <Textarea rows={3} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </ConfirmDialog>
    </PageShell>
  );
}
