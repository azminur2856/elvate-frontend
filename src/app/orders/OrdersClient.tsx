"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Package } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT } from "@/lib/format";
import { ALL_ORDER_STATUSES, PAYMENT_METHOD_LABELS } from "@/lib/orders";
import type { OrderStatus, OrderSummary, Paginated } from "@/types/commerce";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderBadges";
import { StatusTabs } from "@/components/orders/StatusTabs";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState } from "@/components/shop/EmptyState";
import { ProductImage } from "@/components/shop/ProductImage";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <article className="relative flex gap-4 rounded-xl border bg-card p-4 transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md">
      <span className="relative size-16 shrink-0 overflow-hidden rounded-lg border sm:size-20">
        <ProductImage src={order.firstItemImage} alt="" sizes="80px" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <h2 className="font-sans text-base font-semibold">
            <Link
              href={`/orders/${order.id}`}
              className="font-mono after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-0"
            >
              {order.orderNumber}
            </Link>
          </h2>
          <p className="text-sm text-muted-foreground">
            <LocalTime value={order.createdAt} /> · {order.itemCount} {order.itemCount === 1 ? "item" : "items"} ·{" "}
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <p className="font-heading text-lg font-semibold tabular-nums">{formatBDT(order.total)}</p>
          <ChevronRight aria-hidden="true" className="ml-auto size-5 text-muted-foreground sm:ml-0" />
        </div>
      </div>
    </article>
  );
}

export default function OrdersClient({
  initialStatus,
  initialPage,
}: {
  initialStatus: OrderStatus | null;
  initialPage: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<OrderStatus | null>(initialStatus);
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<Paginated<OrderSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keep the URL shareable / back-button friendly.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [status, page, pathname, router]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get<Paginated<OrderSummary>>("/orders/my", { params: { page, pageSize: PAGE_SIZE, status: status ?? undefined } })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(getErrorMessage(err, "Could not load your orders."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, page]);

  return (
    <PageShell width="lg" title="My orders" description="Track deliveries, pay for card orders and review what you bought.">
      <StatusTabs
        value={status}
        statuses={ALL_ORDER_STATUSES}
        onChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        className="mb-6"
      />

      {error ? <FormMessage variant="error" className="mb-4">{error}</FormMessage> : null}

      <div aria-busy={loading} aria-live="polite">
        {loading && !data ? (
          <div role="status" aria-label="Loading orders" className="grid gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <ul className={loading ? "grid gap-3 opacity-60 transition-opacity" : "grid gap-3 transition-opacity"}>
            {data.items.map((o) => (
              <li key={o.id}>
                <OrderCard order={o} />
              </li>
            ))}
          </ul>
        ) : !error ? (
          <EmptyState
            icon={Package}
            title={status ? "No orders with this status" : "No orders yet"}
            description={status ? "Try another status." : "When you place an order, you can follow it here."}
            action={
              status ? (
                <Button variant="outline" onClick={() => setStatus(null)}>
                  Show all orders
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/shop">Start shopping</Link>
                </Button>
              )
            }
          />
        ) : null}
      </div>

      {data && data.totalPages > 1 ? (
        <PaginationControls className="mt-6" page={page} totalPages={data.totalPages} onPageChange={setPage} />
      ) : null}
    </PageShell>
  );
}
