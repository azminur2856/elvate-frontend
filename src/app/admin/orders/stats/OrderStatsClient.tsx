"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT } from "@/lib/format";
import { ALL_ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/orders";
import type { OrderStats, PaymentMethod } from "@/types/commerce";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatsSkeleton } from "@/components/admin/StatsSkeleton";
import { StockBadge } from "@/components/admin/StockBadge";
import { axisProps, CHART_COLORS, gridProps, legendProps, tooltipProps } from "@/components/admin/chart-theme";
import { PageShell } from "@/components/shared/PageShell";
import { ProductImage } from "@/components/shop/ProductImage";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RANGES = [7, 30, 90, 365] as const;

type TopProduct = OrderStats["topProducts"][number];
type LowStock = OrderStats["lowStock"][number];

const topColumns: DataTableColumn<TopProduct>[] = [
  {
    key: "product",
    header: "Product",
    cell: (p) => (
      <span className="flex items-center gap-3">
        <span className="relative size-9 shrink-0 overflow-hidden rounded-md border">
          <ProductImage src={p.image} alt="" sizes="36px" />
        </span>
        <span className="font-medium">{p.name}</span>
      </span>
    ),
  },
  { key: "qty", header: "Sold", numeric: true, cell: (p) => p.quantity },
  { key: "revenue", header: "Revenue", numeric: true, cell: (p) => formatBDT(p.revenue) },
];

const lowColumns: DataTableColumn<LowStock>[] = [
  { key: "product", header: "Product", cell: (l) => <span className="font-medium">{l.productName}</span> },
  { key: "variant", header: "Variant", cell: (l) => l.variantLabel ?? "—" },
  { key: "stock", header: "Stock", align: "right", cell: (l) => <StockBadge stock={l.stock} /> },
];

export default function OrderStatsClient() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get<OrderStats>("/admin/orders/stats", { params: { days } })
      .then((res) => !cancelled && setStats(res.data))
      .catch((err) => {
        if (cancelled) return;
        setStats(null);
        setError(getErrorMessage(err, "Could not load order statistics."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [days]);

  const byDay = (stats?.byDay ?? []).map((d) => ({ ...d, count: Number(d.count), revenue: Number(d.revenue) }));
  const byStatus = ALL_ORDER_STATUSES.map((s) => ({ name: ORDER_STATUS_LABELS[s], value: Number(stats?.countByStatus?.[s] ?? 0) })).filter(
    (s) => s.value > 0
  );
  const byMethod = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[])
    .map((m) => ({ name: PAYMENT_METHOD_LABELS[m], value: Number(stats?.paymentMethodSplit?.[m] ?? 0) }))
    .filter((m) => m.value > 0);

  return (
    <PageShell
      width="xl"
      title="Order statistics"
      description="Revenue counts paid orders only."
      actions={
        <div className="flex items-end gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="stats-range" className="text-xs text-muted-foreground">
              Period
            </Label>
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v) as (typeof RANGES)[number])}>
              <SelectTrigger id="stats-range" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {RANGES.map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    Last {r} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      }
    >
      {error ? <FormMessage variant="error" className="mb-4">{error}</FormMessage> : null}
      {loading && !stats ? (
        <StatsSkeleton cards={4} />
      ) : stats ? (
        <div className="grid gap-6" aria-busy={loading}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Orders" value={stats.totalOrders} accent={1} />
            <StatCard label="Revenue" value={formatBDT(stats.revenue)} accent={2} />
            <StatCard label="Average order" value={formatBDT(stats.avgOrderValue)} accent={3} />
            <StatCard
              label="Waiting for confirmation"
              value={stats.pendingCount}
              accent={4}
              hint={
                stats.pendingCount > 0 ? (
                  <Link href="/admin/orders/view?status=PENDING" className="text-link hover:underline">
                    Review pending orders
                  </Link>
                ) : (
                  "All caught up"
                )
              }
            />
          </div>

          <ChartCard title="Orders and revenue per day" description={`Last ${days} days`}>
            {byDay.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={byDay}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis yAxisId="count" {...axisProps} allowDecimals={false} />
                  <YAxis yAxisId="revenue" orientation="right" {...axisProps} />
                  <Tooltip
                    {...tooltipProps}
                    formatter={(v, name) => (name === "Revenue" ? formatBDT(Number(v)) : v)}
                  />
                  <Legend {...legendProps} />
                  <Bar yAxisId="count" dataKey="count" name="Orders" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Line yAxisId="revenue" dataKey="revenue" name="Revenue" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No orders in this period.</p>
            )}
          </ChartCard>

          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Orders by status">
              {byStatus.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                      {byStatus.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend {...legendProps} />
                    <Tooltip {...tooltipProps} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
              )}
            </ChartCard>
            <ChartCard title="Payment method">
              {byMethod.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={byMethod}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    >
                      {byMethod.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipProps} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="grid content-start gap-3">
              <h2 className="text-lg font-semibold">Top products</h2>
              <DataTable
                columns={topColumns}
                rows={stats.topProducts}
                rowKey={(p) => p.productId}
                emptyMessage="No sales in this period."
                caption="Top products"
              />
            </section>
            <section className="grid content-start gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Low stock</h2>
                <Button asChild variant="link" size="sm" className="h-auto px-0 text-link">
                  <Link href="/admin/products/view">Manage products</Link>
                </Button>
              </div>
              <DataTable
                columns={lowColumns}
                rows={stats.lowStock}
                rowKey={(l) => l.variantId}
                emptyMessage="Nothing is running low."
                caption="Low stock variants"
              />
            </section>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
