"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, CheckCircle2, ChevronDown, Copy, MapPin, PackageCheck, Phone, Truck, Undo2 } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT } from "@/lib/format";
import type { DeliveryOrder, DeliveryStats, OrderDetail, Paginated } from "@/types/commerce";
import { cn } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderBadges";
import { OrderItemsList } from "@/components/orders/OrderParts";
import { StatCard } from "@/components/admin/StatCard";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shop/EmptyState";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGE_SIZE = 10;
type Scope = "active" | "completed";
type Action = { order: DeliveryOrder; status: "OUT_FOR_DELIVERY" | "DELIVERED" | "RETURN_REQUESTED" };

const addressText = (o: DeliveryOrder) =>
  [o.shippingAddress.addressLine, o.shippingAddress.area, o.shippingAddress.city, o.shippingAddress.postalCode]
    .filter(Boolean)
    .join(", ");

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Address copied.");
  } catch {
    toast.error("Couldn't copy. Please select the address and copy it.");
  }
}

/** What the cash strip says: still to collect, collected, nothing (returns) or paid online. */
function cashLine(order: DeliveryOrder): { label: string; amount: number } {
  if (order.codDue > 0) return { label: "Collect in cash", amount: order.codDue };
  if (order.status === "RETURN_REQUESTED" || order.status === "RETURNED" || order.status === "CANCELLED") {
    return { label: "Nothing to collect", amount: 0 };
  }
  if (order.status === "DELIVERED" && order.paymentMethod === "COD") return { label: "Cash collected", amount: order.total };
  return { label: "Already paid", amount: 0 };
}

function OrderCard({ order, onAction }: { order: DeliveryOrder; onAction: (a: Action) => void }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const address = addressText(order);
  const phone = order.customerPhone ?? order.shippingAddress.phone;
  const cash = cashLine(order);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !detail) {
      setLoadingDetail(true);
      try {
        setDetail((await api.get<OrderDetail>(`/orders/${order.id}`)).data);
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not load the items."));
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  return (
    <article className="grid gap-4 rounded-xl border bg-card p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-mono text-base font-semibold">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · <LocalTime value={order.createdAt} />
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {/* BE-29: an admin finished this order for the delivery man. */}
          {order.correctedByAdmin || detail?.statusHistory.some((h) => h.correction) ? (
            <Badge variant="warning">Corrected by admin</Badge>
          ) : null}
          <OrderStatusBadge status={order.status} />
        </div>
      </header>

      <div className="grid gap-1">
        <p className="flex items-center gap-2 font-medium">
          <UserAvatar name={order.shippingAddress.fullName} avatarUrl={order.customer?.avatarUrl ?? null} />
          {order.shippingAddress.fullName}
        </p>
        <address className="text-sm not-italic text-muted-foreground">{address}</address>
        <div className="mt-2 flex flex-wrap gap-2">
          {phone ? (
            <Button asChild size="sm">
              <a href={`tel:${phone}`}>
                <Phone aria-hidden="true" />
                Call {phone}
              </a>
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => copy(`${order.shippingAddress.fullName}, ${address}`)}>
            <Copy aria-hidden="true" />
            Copy address
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin aria-hidden="true" />
              Open in Maps<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg px-3 py-2",
          order.codDue > 0 ? "bg-warning/15" : "bg-success/10"
        )}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Banknote aria-hidden="true" className="size-4" />
          {cash.label}
        </span>
        <span className="font-heading text-lg font-bold tabular-nums">{cash.amount > 0 ? formatBDT(cash.amount) : "৳0"}</span>
      </div>

      <div>
        <Button variant="ghost" size="sm" className="-ml-2" onClick={toggle} aria-expanded={open}>
          <ChevronDown aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} />
          {open ? "Hide items" : "Show items"}
        </Button>
        {open ? (
          <div className="mt-2">
            {loadingDetail ? (
              <Spinner size="sm" label="Loading items" />
            ) : detail ? (
              <>
                <OrderItemsList items={detail.items} />
                {detail.notes ? (
                  <p className="mt-3 rounded-md bg-muted p-2 text-sm">
                    <span className="font-medium">Customer note: </span>
                    {detail.notes}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {order.status === "SHIPPED" ? (
        <Button size="lg" className="w-full" onClick={() => onAction({ order, status: "OUT_FOR_DELIVERY" })}>
          <Truck aria-hidden="true" />
          Picked up, out for delivery
        </Button>
      ) : order.status === "OUT_FOR_DELIVERY" ? (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button size="lg" onClick={() => onAction({ order, status: "DELIVERED" })}>
            <PackageCheck aria-hidden="true" />
            Delivered
          </Button>
          <Button size="lg" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onAction({ order, status: "RETURN_REQUESTED" })}>
            <Undo2 aria-hidden="true" />
            Return
          </Button>
        </div>
      ) : order.status === "RETURN_REQUESTED" ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm">
          Bring the parcel back to the shop. Staff will confirm the return.
        </p>
      ) : null}
    </article>
  );
}

/** Delivery man's work list. Mobile-first: big buttons, call / maps shortcuts. */
export default function DeliveryClient() {
  const [scope, setScope] = useState<Scope>("active");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<DeliveryOrder> | null>(null);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState("");
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadStats = useCallback(() => {
    api
      .get<DeliveryStats>("/delivery/stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData((await api.get<Paginated<DeliveryOrder>>("/delivery/orders", { params: { scope, page, pageSize: PAGE_SIZE } })).data);
    } catch (err) {
      setData(null);
      setError(getErrorMessage(err, "Could not load your deliveries."));
    } finally {
      setLoading(false);
    }
  }, [scope, page]);

  useEffect(() => loadStats(), [loadStats]);
  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const closeAction = () => {
    setAction(null);
    setNote("");
    setCashConfirmed(false);
  };

  const needsCash = action?.status === "DELIVERED" && action.order.codDue > 0;
  const needsNote = action?.status === "RETURN_REQUESTED";
  const blocked = (needsCash && !cashConfirmed) || (needsNote && !note.trim());

  const submit = async () => {
    if (!action || blocked) return;
    setSaving(true);
    try {
      await api.patch(`/delivery/orders/${action.order.id}/status`, {
        status: action.status,
        note: note.trim() || undefined,
      });
      toast.success(
        action.status === "OUT_FOR_DELIVERY"
          ? "Marked as out for delivery."
          : action.status === "DELIVERED"
            ? "Delivered. Well done!"
            : "Return requested. Bring the parcel back to the shop."
      );
      closeAction();
      loadStats();
      await loadOrders();
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      if (status === 400 || status === 404) {
        // Someone else moved or re-assigned the order meanwhile: show its real state.
        toast.error("This order changed in the meantime. The list is up to date now.");
        closeAction();
        loadStats();
        await loadOrders();
      } else {
        toast.error(getErrorMessage(err, "Could not update the order."));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell width="md" title="Deliveries" description="Your assigned orders. Call the customer before you go.">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats ? (
          <>
            <StatCard label="Assigned" value={stats.assigned} accent={1} />
            <StatCard label="On the way" value={stats.outForDelivery} accent={3} />
            <StatCard label="Delivered today" value={stats.deliveredToday} accent={2} hint={`${stats.deliveredTotal} in total`} />
            <StatCard label="Cash today" value={formatBDT(stats.codCollectedToday)} accent={4} />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        )}
      </div>

      <Tabs
        value={scope}
        onValueChange={(v) => {
          setScope(v as Scope);
          setPage(1);
        }}
      >
        <TabsList aria-label="Deliveries">
          <TabsTrigger value="active">
            <Truck aria-hidden="true" />
            To deliver
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 aria-hidden="true" />
            Completed
          </TabsTrigger>
        </TabsList>
        <TabsContent value={scope} aria-busy={loading}>
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}
          {loading && !data ? (
            <div role="status" aria-label="Loading deliveries" className="grid gap-3">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : data && data.items.length ? (
            <ul className="grid gap-4">
              {data.items.map((o) => (
                <li key={o.id}>
                  <OrderCard order={o} onAction={setAction} />
                </li>
              ))}
            </ul>
          ) : !error ? (
            <EmptyState
              icon={scope === "active" ? Truck : CheckCircle2}
              title={scope === "active" ? "Nothing to deliver right now" : "No completed deliveries yet"}
              description={scope === "active" ? "New assignments appear here as soon as an admin assigns them to you." : undefined}
            />
          ) : null}
          {data && data.totalPages > 1 ? (
            <PaginationControls className="mt-6" page={page} totalPages={data.totalPages} onPageChange={setPage} />
          ) : null}
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(o) => !o && !saving && closeAction()}
        title={
          action?.status === "OUT_FOR_DELIVERY"
            ? "Start this delivery?"
            : action?.status === "DELIVERED"
              ? "Mark as delivered?"
              : "Return this parcel?"
        }
        description={
          action
            ? action.status === "OUT_FOR_DELIVERY"
              ? `The customer sees that ${action.order.orderNumber} is on its way.`
              : action.status === "DELIVERED"
                ? needsCash
                  ? `Confirm you collected ${formatBDT(action.order.codDue)} in cash.`
                  : "This order was paid online; nothing to collect."
                : "The parcel goes back to the shop and staff confirm the return when it arrives. Explain what happened."
            : undefined
        }
        confirmLabel={action?.status === "OUT_FOR_DELIVERY" ? "On my way" : action?.status === "DELIVERED" ? "Delivered" : "Request return"}
        destructive={action?.status === "RETURN_REQUESTED"}
        confirmDisabled={blocked}
        loading={saving}
        onConfirm={submit}
      >
        {needsCash ? (
          <div className="flex items-start gap-2 rounded-lg bg-warning/15 p-3">
            <Checkbox id="cash-confirm" checked={cashConfirmed} onCheckedChange={(c) => setCashConfirmed(c === true)} className="mt-0.5" />
            <Label htmlFor="cash-confirm" className="leading-snug">
              I collected {action ? formatBDT(action.order.codDue) : ""} in cash
            </Label>
          </div>
        ) : null}
        {action ? (
          <FormField
            id="delivery-note"
            label={needsNote ? "What happened?" : "Note (optional)"}
            required={needsNote}
            hint={needsNote ? "e.g. Customer refused the parcel, wrong address, no answer after 3 calls" : undefined}
          >
            <Textarea rows={3} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
        ) : null}
        {/* Hidden, not removed, once satisfied: removing it moved the
            confirm button up under the rider's finger. */}
        {needsCash || needsNote ? (
          <p className={cn("text-xs text-muted-foreground", !blocked && "invisible")}>
            {needsCash ? <Badge variant="warning">Tick the box to confirm the cash</Badge> : "A note is required."}
          </p>
        ) : null}
      </ConfirmDialog>
    </PageShell>
  );
}
