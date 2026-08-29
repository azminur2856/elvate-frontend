"use client";

import { useEffect, useState } from "react";
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
import { formatDate, PLAN_LABELS } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { FormMessage } from "@/components/forms/FormMessage";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatsSkeleton } from "@/components/admin/StatsSkeleton";
import { axisProps, CHART_COLORS, gridProps, legendProps, tooltipProps } from "@/components/admin/chart-theme";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type RecentSub = { id: string; plan: "1m" | "6m" | "12m"; isCancelled: boolean; startDate: string; endDate: string; userName?: string };
type Stats = {
  totalSubscriptions: number;
  countByPlan: Record<string, number>;
  activeCount: number;
  cancelledCount: number;
  recentSubscriptions: RecentSub[];
};

const isExpired = (s: RecentSub) => new Date(s.endDate) < new Date();

function statusBadge(s: RecentSub) {
  if (isExpired(s)) return <Badge variant="destructive">Expired</Badge>;
  if (s.isCancelled) return <Badge variant="warning">Auto-renew off</Badge>;
  return <Badge variant="success">Active</Badge>;
}

const columns: DataTableColumn<RecentSub>[] = [
  { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => i + 1 },
  { key: "user", header: "User", cell: (s) => s.userName || "—" },
  { key: "plan", header: "Plan", cell: (s) => PLAN_LABELS[s.plan] ?? s.plan },
  { key: "status", header: "Status", cell: statusBadge },
  { key: "start", header: "Start", cell: (s) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(s.startDate)}</span> },
  { key: "end", header: "End", cell: (s) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(s.endDate)}</span> },
];

export default function SubscriptionStatsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/subscriptions/subStats")
      .then((res) => !cancelled && setStats(res.data))
      .catch(() => !cancelled && setStats(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const statusBar = stats
    ? (() => {
        let active = 0, off = 0, expired = 0;
        stats.recentSubscriptions.forEach((s) => (isExpired(s) ? expired++ : s.isCancelled ? off++ : active++));
        return [
          { status: "Active", count: active },
          { status: "Auto-renew off", count: off },
          { status: "Expired", count: expired },
        ];
      })()
    : [];
  const planPie = stats ? Object.entries(stats.countByPlan).map(([k, value]) => ({ name: PLAN_LABELS[k] ?? k, value })) : [];

  return (
    <PageShell width="xl" title="Subscription statistics" description="Plan mix, renewal status and recent subscriptions.">
      {loading ? (
        <StatsSkeleton />
      ) : !stats ? (
        <FormMessage variant="error">No subscription statistics available right now.</FormMessage>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total" value={stats.totalSubscriptions} accent={1} />
            <StatCard label="Active" value={stats.activeCount} accent={2} />
            <StatCard label="Cancelled" value={stats.cancelledCount} accent={5} />
            <StatCard
              label="By plan"
              value={<span className="text-xl">{Object.entries(stats.countByPlan).map(([k, v]) => `${PLAN_LABELS[k] ?? k}: ${v}`).join(" · ") || "—"}</span>}
              accent={3}
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Recent subscription status">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusBar}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="status" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip {...tooltipProps} />
                  <Bar dataKey="count" name="Subscriptions" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Subscriptions by plan">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={planPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}>
                    {planPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Legend {...legendProps} />
                  <Tooltip {...tooltipProps} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold">Recent subscriptions</h2>
            <DataTable columns={columns} rows={stats.recentSubscriptions} rowKey={(s) => s.id} emptyMessage="No recent subscriptions." caption="Recent subscriptions" />
          </section>
        </div>
      )}
    </PageShell>
  );
}
