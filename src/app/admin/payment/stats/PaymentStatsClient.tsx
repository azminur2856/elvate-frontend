"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/lib/authAxios";
import { formatDateTime, formatMoney } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { FormMessage } from "@/components/forms/FormMessage";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatsSkeleton } from "@/components/admin/StatsSkeleton";
import { axisProps, CHART_COLORS, gridProps, legendProps, tooltipProps } from "@/components/admin/chart-theme";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type Payment = { id: string; userName?: string; amount: number; currency: string; invoiceUrl: string; paidAt: string };
type Stats = {
  totalPayments: number;
  totalAmount: number;
  amountByCurrency: { currency: string; count: number; sum: number }[];
  byDay: { date: string; count: number | string; sum: number | string }[];
  recentPayments: Payment[];
};

const columns: DataTableColumn<Payment>[] = [
  { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => i + 1 },
  { key: "user", header: "User", cell: (p) => p.userName || "—" },
  { key: "amount", header: "Amount", numeric: true, cell: (p) => formatMoney(p.amount) },
  { key: "currency", header: "Currency", cell: (p) => p.currency.toUpperCase() },
  { key: "paidAt", header: "Paid at", cell: (p) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(p.paidAt)}</span> },
  {
    key: "invoice",
    header: "Invoice",
    cell: (p) => (
      <Button asChild variant="link" size="sm" className="h-auto p-0 text-link">
        <a href={p.invoiceUrl} target="_blank" rel="noopener noreferrer">
          View <ExternalLink aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
        </a>
      </Button>
    ),
  },
];

export default function PaymentStatsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/subscriptions/paymentStats")
      .then((res) => !cancelled && setStats(res.data))
      .catch(() => !cancelled && setStats(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const byDay = stats ? stats.byDay.map((d) => ({ date: d.date, count: Number(d.count), sum: Number(d.sum) })) : [];
  const byCurrency = stats ? stats.amountByCurrency.map((c) => ({ name: c.currency.toUpperCase(), value: c.sum })) : [];

  return (
    <PageShell width="xl" title="Payment statistics" description="Volume, revenue and the most recent payments.">
      {loading ? (
        <StatsSkeleton cards={3} />
      ) : !stats ? (
        <FormMessage variant="error">No payment statistics available right now.</FormMessage>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total payments" value={stats.totalPayments} accent={1} />
            <StatCard label="Total amount" value={formatMoney(stats.totalAmount)} accent={2} />
            <StatCard
              label="By currency"
              value={
                <span className="text-xl">
                  {stats.amountByCurrency.map((c) => `${c.currency.toUpperCase()} ${formatMoney(c.sum)}`).join(" · ") || "—"}
                </span>
              }
              accent={3}
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Payments per day (last 7 days)">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byDay}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip {...tooltipProps} />
                  <Bar dataKey="count" name="Payments" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Amount by currency">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={byCurrency}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {byCurrency.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Legend {...legendProps} />
                  <Tooltip {...tooltipProps} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold">Recent payments</h2>
            <DataTable columns={columns} rows={stats.recentPayments} rowKey={(p) => p.id} emptyMessage="No recent payments." caption="Recent payments" />
          </section>
        </div>
      )}
    </PageShell>
  );
}
