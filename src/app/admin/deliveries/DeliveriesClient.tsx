"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import { FilterX, RefreshCw, Search } from "lucide-react";
import api from "@/lib/authAxios";
import { cashToCollect, DELIVERY_VIEWS, type DeliveryView, SEND_OUT_AGAIN_STATUS, todayInput } from "@/lib/deliveries";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DeliveriesSummary, DeliveryManOption, OrderSummary, Paginated } from "@/types/commerce";
import { useDebounce } from "@/hooks/useDebounce";
import { StatCard } from "@/components/admin/StatCard";
import { AssignDeliveryManDialog, type AssignTarget } from "@/components/admin/deliveries/AssignDeliveryManDialog";
import { OrderStatusBadge } from "@/components/orders/OrderBadges";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 15;
const ANY = "any";

/** "YYYY-MM-DD" → ISO at the start / end of that local day. */
const dayIso = (day: string, end: boolean) =>
  day ? new Date(`${day}T${end ? "23:59:59.999" : "00:00:00"}`).toISOString() : undefined;

type CardDef = { label: string; value: (s: DeliveriesSummary) => React.ReactNode; view?: DeliveryView; today?: boolean };

const CARDS: CardDef[] = [
  { label: "Waiting for a delivery man", value: (s) => s.waitingForDeliveryMan, view: "waiting" },
  { label: "Assigned, not picked up", value: (s) => s.assignedNotPickedUp, view: "assigned" },
  { label: "Out for delivery", value: (s) => s.outForDelivery, view: "out" },
  { label: "Delivered today", value: (s) => s.deliveredToday, view: "delivered", today: true },
  { label: "Return requests", value: (s) => s.returnRequests, view: "returns" },
  { label: "Cash collected today", value: (s) => formatBDT(s.cashCollectedToday) },
];

export type DeliveriesClientProps = { initialView: DeliveryView; initialToday: boolean };

/**
 * Delivery management for ADMIN and STAFF (FE-29 / BE-29): they assign and
 * reassign delivery men and settle returns; only the delivery man moves an
 * order to Out for delivery / Delivered / Return requested, so there are no
 * such buttons here.
 */
export default function DeliveriesClient({ initialView, initialToday }: DeliveriesClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [summary, setSummary] = useState<DeliveriesSummary | null>(null);
  const [summaryState, setSummaryState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [deliveryMen, setDeliveryMen] = useState<DeliveryManOption[]>([]);

  const [view, setView] = useState<DeliveryView>(initialView);
  const [deliveryManId, setDeliveryManId] = useState<string>(ANY);
  const [q, setQ] = useState("");
  const query = useDebounce(q.trim(), 300);
  const [from, setFrom] = useState(initialToday ? todayInput() : "");
  const [to, setTo] = useState(initialToday ? todayInput() : "");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<OrderSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [assigning, setAssigning] = useState<AssignTarget | null>(null);
  // Settling a return request: confirm it (RETURNED) or send the parcel out again.
  const [settling, setSettling] = useState<{ order: OrderSummary; to: "RETURNED" | "AGAIN" } | null>(null);
  const [settleNote, setSettleNote] = useState("");
  const [settleSaving, setSettleSaving] = useState(false);

  const rangeError = from && to && from > to ? "The start date must be on or before the end date." : "";
  const filtered = Boolean(view !== "all" || deliveryManId !== ANY || query || from || to);

  const loadSummary = useCallback(() => {
    api
      .get<DeliveriesSummary>("/admin/deliveries/summary")
      .then((res) => {
        setSummary(res.data);
        setSummaryState("ready");
      })
      .catch((err) => {
        setSummary(null);
        setSummaryState(isAxiosError(err) && err.response?.status === 404 ? "missing" : "error");
      });
  }, []);

  useEffect(() => loadSummary(), [loadSummary]);

  useEffect(() => {
    api
      .get<DeliveryManOption[]>("/admin/orders/delivery-men")
      .then((res) => setDeliveryMen(res.data))
      .catch(() => setDeliveryMen([]));
  }, []);

  useEffect(() => {
    if (rangeError) return;
    let cancelled = false;
    const def = DELIVERY_VIEWS[view];
    setLoading(true);
    setError("");
    api
      .get<Paginated<OrderSummary>>("/admin/orders", {
        params: {
          page,
          pageSize: PAGE_SIZE,
          statuses: def.statuses.join(","),
          // Also the single-status filter every server version understands.
          status: def.statuses.length === 1 ? def.statuses[0] : undefined,
          unassigned: "unassigned" in def && def.unassigned ? true : undefined,
          deliveryManId: deliveryManId === ANY ? undefined : deliveryManId,
          q: query || undefined,
          fromDate: dayIso(from, false),
          toDate: dayIso(to, true),
        },
      })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(getErrorMessage(err, "Could not load the deliveries."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [view, deliveryManId, query, from, to, page, rangeError, reloadKey]);

  /** Re-read the table and the numbers (delivery men change them all day). */
  const refresh = useCallback(() => {
    setReloadKey((k) => k + 1);
    loadSummary();
  }, [loadSummary]);

  const settle = async () => {
    if (!settling) return;
    setSettleSaving(true);
    try {
      await api.patch(`/admin/orders/${settling.order.id}/status`, {
        status: settling.to === "RETURNED" ? "RETURNED" : SEND_OUT_AGAIN_STATUS,
        note: settleNote.trim() || undefined,
      });
      toast.success(
        settling.to === "RETURNED"
          ? `${settling.order.orderNumber} is returned.`
          : `${settling.order.orderNumber} goes out again with ${settling.order.deliveryMan?.name ?? "its delivery man"}.`
      );
      setSettling(null);
      setSettleNote("");
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the order."));
    } finally {
      setSettleSaving(false);
    }
  };

  const applyView = (next: DeliveryView, today = false) => {
    setView(next);
    setFrom(today ? todayInput() : "");
    setTo(today ? todayInput() : "");
    setPage(1);
    const params = new URLSearchParams();
    if (next !== "all") params.set("view", next);
    if (today) params.set("day", "today");
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };

  const clear = () => {
    applyView("all");
    setDeliveryManId(ANY);
    setQ("");
  };

  const columns: DataTableColumn<OrderSummary>[] = [
    {
      key: "order",
      header: "Order",
      cell: (o) => (
        <div className="grid gap-0.5">
          <Link href={`/admin/orders/${o.id}`} className="font-mono font-medium text-link hover:underline">
            {o.orderNumber}
          </Link>
          <LocalTime value={o.createdAt} mode="datetime" className="text-xs text-muted-foreground" />
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      className: "min-w-40",
      cell: (o) =>
        o.customer ? (
          <span className="flex items-center gap-2">
            <UserAvatar name={o.customer.name} avatarUrl={o.customer.avatarUrl ?? null} className="size-8 text-xs" />
            <span className="font-medium">{o.customer.name}</span>
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "area",
      header: "Area / city",
      cell: (o) =>
        o.shippingAddress ? (
          [o.shippingAddress.area, o.shippingAddress.city].filter(Boolean).join(", ")
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "deliveryMan",
      header: "Delivery man",
      cell: (o) =>
        o.deliveryMan?.name ??
        (o.status === "PROCESSING" || o.status === "SHIPPED" ? (
          <Badge variant="warning">Not assigned</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )),
    },
    { key: "status", header: "Status", cell: (o) => <OrderStatusBadge status={o.status} /> },
    {
      key: "cash",
      header: "Cash to collect",
      align: "right",
      cell: (o) => {
        const cash = cashToCollect(o);
        return cash > 0 ? (
          <span className="font-medium tabular-nums">{formatBDT(cash)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: "updated",
      header: "Last update",
      cell: (o) =>
        o.updatedAt ? (
          <LocalTime value={o.updatedAt} mode="datetime" className="text-sm" />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (o) => (
        <div className="flex flex-wrap justify-end gap-2">
          {o.status === "PROCESSING" || o.status === "SHIPPED" ? (
            <Button size="sm" variant="outline" onClick={() => setAssigning(o)}>
              {o.deliveryMan ? "Reassign" : "Assign"}
              <span className="sr-only"> order {o.orderNumber}</span>
            </Button>
          ) : null}
          {o.status === "RETURN_REQUESTED" ? (
            <>
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setSettling({ order: o, to: "RETURNED" })}>
                Confirm return<span className="sr-only"> of order {o.orderNumber}</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSettling({ order: o, to: "AGAIN" })}>
                Send out again<span className="sr-only"> order {o.orderNumber}</span>
              </Button>
            </>
          ) : null}
          <Button asChild size="sm" variant="ghost">
            <Link href={`/admin/orders/${o.id}`}>
              Open<span className="sr-only"> order {o.orderNumber}</span>
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      width="xl"
      title="Deliveries"
      description="Assign delivery men, follow orders on their way and settle returns. Delivery men update the progress themselves."
    >
      <section aria-label="Delivery numbers" className="mb-6">
        {summaryState === "loading" ? (
          <div role="status" aria-label="Loading delivery numbers" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {CARDS.map((c) => (
              <Skeleton key={c.label} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : summary ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {CARDS.map((c, i) => (
              <li key={c.label}>
                {c.view ? (
                  <button
                    type="button"
                    onClick={() => applyView(c.view!, c.today)}
                    aria-pressed={view === c.view}
                    className="block h-full w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <StatCard
                      label={c.label}
                      value={c.value(summary)}
                      accent={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}
                      className={cn("h-full transition-colors hover:bg-muted/50", view === c.view && "ring-1 ring-primary")}
                    />
                  </button>
                ) : (
                  <StatCard label={c.label} value={c.value(summary)} accent={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5} className="h-full" />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <FormMessage variant={summaryState === "missing" ? "info" : "error"}>
            {summaryState === "missing"
              ? "The delivery numbers are not available on this server yet."
              : "Could not load the delivery numbers."}
          </FormMessage>
        )}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-label="Orders to deliver" className="grid min-w-0 gap-4">
          <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="grid gap-2">
              <Label htmlFor="delivery-view">Status</Label>
              <Select value={view} onValueChange={(v) => applyView(v as DeliveryView)}>
                <SelectTrigger id="delivery-view" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DELIVERY_VIEWS) as DeliveryView[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {DELIVERY_VIEWS[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="delivery-man-filter">Delivery man</Label>
              <Select
                value={deliveryManId}
                onValueChange={(v) => {
                  setDeliveryManId(v);
                  setPage(1);
                }}
              >
                <SelectTrigger id="delivery-man-filter" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Anyone</SelectItem>
                  {deliveryMen.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormField id="delivery-from" label="From">
              <Input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </FormField>
            <FormField id="delivery-to" label="To" error={rangeError}>
              <Input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </FormField>
            <div className="grid gap-2">
              <Label htmlFor="delivery-search">Search</Label>
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="delivery-search"
                  type="search"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Order, e-mail or name"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {data ? `${data.total} ${data.total === 1 ? "order" : "orders"}` : loading ? "Loading…" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {filtered ? (
                <Button variant="ghost" size="sm" onClick={clear}>
                  <FilterX aria-hidden="true" />
                  Clear filters
                </Button>
              ) : null}
              <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                <RefreshCw aria-hidden="true" />
                Refresh
              </Button>
            </div>
          </div>

          {error ? (
            <div className="grid justify-items-start gap-3">
              <FormMessage variant="error">{error}</FormMessage>
              <Button variant="outline" size="sm" onClick={refresh}>
                Try again
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(o) => o.id}
              loading={loading && !data}
              loadingLabel="Loading deliveries"
              emptyMessage={filtered ? "No orders match these filters." : "No orders to deliver right now."}
              caption="Orders being delivered"
            />
          )}
          {data && data.totalPages > 1 ? (
            <PaginationControls page={page} totalPages={data.totalPages} onPageChange={setPage} />
          ) : null}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery men</CardTitle>
            <CardDescription>Active orders, out now, delivered and cash collected today.</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryState === "loading" ? (
              <div role="status" aria-label="Loading delivery men" className="grid gap-3">
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
              </div>
            ) : summary && summary.deliveryMen.length ? (
              <ul className="grid gap-3">
                {summary.deliveryMen.map((d) => (
                  <li key={d.id} className="grid gap-1 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{d.name}</span>
                      {d.phone ? (
                        <a href={`tel:${d.phone}`} className="text-sm text-link hover:underline">
                          {d.phone}
                        </a>
                      ) : null}
                    </div>
                    <dl className="grid grid-cols-2 gap-x-3 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Active</dt>
                        <dd className="tabular-nums">{d.active}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Out now</dt>
                        <dd className="tabular-nums">{d.outNow}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Delivered</dt>
                        <dd className="tabular-nums">{d.deliveredToday}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Cash</dt>
                        <dd className="tabular-nums">{formatBDT(d.cashCollectedToday)}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {summary ? "No active delivery men." : "Shown once the delivery numbers are available."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        open={settling !== null}
        onOpenChange={(open) => {
          if (!open && !settleSaving) {
            setSettling(null);
            setSettleNote("");
          }
        }}
        title={settling?.to === "RETURNED" ? "Confirm return?" : "Send out again?"}
        description={
          settling?.to === "RETURNED"
            ? "Only confirm once the parcel is back in the shop. Stock goes back on sale, the coupon use is released and paid card orders are refunded."
            : "The order goes back to Shipped and the delivery man picks it up again. You can still reassign it."
        }
        confirmLabel={settling?.to === "RETURNED" ? "Confirm return" : "Send out again"}
        destructive={settling?.to === "RETURNED"}
        loading={settleSaving}
        onConfirm={settle}
      >
        <div className="grid gap-2">
          <Label htmlFor="settle-note">{settling?.to === "RETURNED" ? "Reason (shown in the timeline)" : "Note (optional)"}</Label>
          <Textarea id="settle-note" rows={3} maxLength={300} value={settleNote} onChange={(e) => setSettleNote(e.target.value)} />
        </div>
      </ConfirmDialog>

      <AssignDeliveryManDialog
        order={assigning}
        onClose={() => setAssigning(null)}
        onAssigned={() => {
          setAssigning(null);
          refresh();
        }}
      />
    </PageShell>
  );
}
