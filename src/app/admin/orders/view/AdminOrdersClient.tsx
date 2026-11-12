"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, FilterX, Search } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT } from "@/lib/format";
import { ALL_ORDER_STATUSES, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/orders";
import type { OrderStatus, OrderSummary, Paginated, PaymentMethod, PaymentStatus } from "@/types/commerce";
import { useDebounce } from "@/hooks/useDebounce";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderBadges";
import { StatusTabs } from "@/components/orders/StatusTabs";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 15;
const ANY = "any";

/** `GET /admin/orders` (+ optional per-status counts, see contract requests). */
type AdminOrdersPage = Paginated<OrderSummary> & { counts?: Partial<Record<OrderStatus | "all", number>> };

/** "YYYY-MM-DD" → ISO at the start / end of that local day. */
const dayIso = (day: string, end: boolean) =>
  day ? new Date(`${day}T${end ? "23:59:59.999" : "00:00:00"}`).toISOString() : undefined;

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
    className: "min-w-44",
    cell: (o) =>
      o.customer ? (
        <div className="flex items-center gap-2">
          <UserAvatar name={o.customer.name} avatarUrl={o.customer.avatarUrl ?? null} className="size-8 text-xs" />
          <div className="grid min-w-0 gap-0.5">
            <span className="font-medium">{o.customer.name}</span>
            <span className="truncate text-xs text-muted-foreground">{o.customer.email}</span>
          </div>
        </div>
      ) : (
        "—"
      ),
  },
  { key: "items", header: "Items", align: "right", cell: (o) => <span className="tabular-nums">{o.itemCount}</span> },
  { key: "total", header: "Total", align: "right", cell: (o) => <span className="font-medium tabular-nums">{formatBDT(o.total)}</span> },
  {
    key: "payment",
    header: "Payment",
    cell: (o) => (
      <div className="grid justify-items-start gap-1">
        <span className="text-xs text-muted-foreground">{PAYMENT_METHOD_LABELS[o.paymentMethod]}</span>
        <PaymentStatusBadge status={o.paymentStatus} />
      </div>
    ),
  },
  { key: "status", header: "Status", cell: (o) => <OrderStatusBadge status={o.status} /> },
  { key: "delivery", header: "Delivery", cell: (o) => o.deliveryMan?.name ?? <span className="text-muted-foreground">—</span> },
];

export default function AdminOrdersClient({ initialStatus }: { initialStatus: OrderStatus | null }) {
  const [status, setStatus] = useState<OrderStatus | null>(initialStatus);
  const [q, setQ] = useState("");
  const query = useDebounce(q.trim(), 300);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | typeof ANY>(ANY);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | typeof ANY>(ANY);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminOrdersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rangeError = from && to && from > to ? "The start date must be on or before the end date." : "";
  const filtered = Boolean(query || paymentStatus !== ANY || paymentMethod !== ANY || from || to);

  useEffect(() => {
    if (rangeError) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get<AdminOrdersPage>("/admin/orders", {
        params: {
          page,
          pageSize: PAGE_SIZE,
          status: status ?? undefined,
          q: query || undefined,
          paymentStatus: paymentStatus === ANY ? undefined : paymentStatus,
          paymentMethod: paymentMethod === ANY ? undefined : paymentMethod,
          fromDate: dayIso(from, false),
          toDate: dayIso(to, true),
        },
      })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(getErrorMessage(err, "Could not load orders."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, status, query, paymentStatus, paymentMethod, from, to, rangeError]);

  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  const clear = () => {
    setQ("");
    setPaymentStatus(ANY);
    setPaymentMethod(ANY);
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <PageShell
      width="xl"
      title="Orders"
      description="Confirm, pack, ship and assign deliveries."
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/orders/stats">
            <BarChart3 aria-hidden="true" />
            Order stats
          </Link>
        </Button>
      }
    >
      <StatusTabs
        value={status}
        statuses={ALL_ORDER_STATUSES}
        onChange={reset(setStatus)}
        counts={data?.counts}
        className="mb-4"
      />

      <section aria-label="Filters" className="mb-6 grid items-start gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="grid gap-1.5 lg:col-span-2">
          <Label htmlFor="order-search">Search</Label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="order-search"
              type="search"
              className="pl-8"
              placeholder="Order number, e-mail or name"
              value={q}
              onChange={(e) => reset(setQ)(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="order-payment-status">Payment</Label>
          <Select value={paymentStatus} onValueChange={(v) => reset(setPaymentStatus)(v as PaymentStatus | typeof ANY)}>
            <SelectTrigger id="order-payment-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any payment status</SelectItem>
              {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {PAYMENT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="order-payment-method">Method</Label>
          <Select value={paymentMethod} onValueChange={(v) => reset(setPaymentMethod)(v as PaymentMethod | typeof ANY)}>
            <SelectTrigger id="order-payment-method" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any method</SelectItem>
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                <SelectItem key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FormField id="order-from" label="From">
          <Input type="date" value={from} max={to || undefined} onChange={(e) => reset(setFrom)(e.target.value)} />
        </FormField>
        <FormField id="order-to" label="To" error={rangeError || undefined}>
          <Input type="date" value={to} min={from || undefined} onChange={(e) => reset(setTo)(e.target.value)} />
        </FormField>
      </section>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {loading ? "Loading…" : data ? `${data.total} ${data.total === 1 ? "order" : "orders"}` : ""}
        </p>
        {filtered ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            <FilterX aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>
      {error ? <FormMessage variant="error" className="mb-4">{error}</FormMessage> : null}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(o) => o.id}
        loading={loading}
        loadingLabel="Loading orders"
        emptyMessage={status || filtered ? "No orders match these filters." : "No orders yet."}
        caption="Orders"
      />
      {data && data.totalPages > 1 ? (
        <PaginationControls className="mt-6" page={page} totalPages={data.totalPages} onPageChange={setPage} />
      ) : null}
    </PageShell>
  );
}
