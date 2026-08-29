"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "@/lib/authAxios";
import { formatDateTime } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { FormMessage } from "@/components/forms/FormMessage";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatsSkeleton } from "@/components/admin/StatsSkeleton";
import { axisProps, gridProps, tooltipProps } from "@/components/admin/chart-theme";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type TopUser = { userId: string; firstName: string; lastName: string; activityCount: number | string };
type Recent = { id: number; activity: string; description: string; createdAt: string; userFullName: string | null };
type Stats = {
  totalLogs: number;
  countByType: Record<string, number>;
  countByDay: { date: string; count: number | string }[];
  topUsers: TopUser[];
  recentActivities: Recent[];
  adminActions: number;
  userActions: number;
};

type TypeRow = { type: string; count: number };

const typeColumns: DataTableColumn<TypeRow>[] = [
  { key: "type", header: "Type", cell: (r) => <span className="font-mono text-sm">{r.type}</span> },
  { key: "count", header: "Count", numeric: true, cell: (r) => r.count },
];

const userColumns: DataTableColumn<TopUser>[] = [
  { key: "sl", header: "#", align: "center", className: "w-12 text-muted-foreground", cell: (_, i) => i + 1 },
  { key: "name", header: "Name", cell: (u) => <span className="font-medium">{u.firstName} {u.lastName}</span> },
  { key: "id", header: "User ID", cell: (u) => <span className="font-mono text-xs text-muted-foreground">{u.userId}</span> },
  { key: "count", header: "Activities", numeric: true, cell: (u) => Number(u.activityCount) },
];

const recentColumns: DataTableColumn<Recent>[] = [
  { key: "date", header: "Date", cell: (l) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(l.createdAt)}</span> },
  { key: "type", header: "Type", cell: (l) => <span className="font-mono text-sm">{l.activity}</span> },
  { key: "user", header: "User", cell: (l) => l.userFullName || "—" },
  { key: "desc", header: "Description", className: "max-w-md whitespace-normal break-words", cell: (l) => l.description || "—" },
];

export default function ActivityStatsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/activity-logs/stats")
      .then((res) => !cancelled && setStats(res.data))
      .catch(() => !cancelled && setStats(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const byDay = stats ? stats.countByDay.map((d) => ({ date: d.date, count: Number(d.count) })) : [];
  const typeRows: TypeRow[] = stats ? Object.entries(stats.countByType).map(([type, count]) => ({ type, count })) : [];

  return (
    <PageShell width="xl" title="Activity statistics" description="Volume over time, breakdown by type, and the most active users.">
      {loading ? (
        <StatsSkeleton />
      ) : !stats ? (
        <FormMessage variant="error">No activity statistics available right now.</FormMessage>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total logs" value={stats.totalLogs} accent={1} />
            <StatCard label="Admin actions" value={stats.adminActions} accent={4} />
            <StatCard label="User actions" value={stats.userActions} accent={2} />
            <StatCard label="Activity types" value={Object.keys(stats.countByType).length} accent={3} />
          </div>
          <ChartCard title="Activity trend (last 7 days)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byDay}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="count" name="Activities" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="grid gap-3">
              <h2 className="text-lg font-semibold">Breakdown by type</h2>
              <DataTable columns={typeColumns} rows={typeRows} rowKey={(r) => r.type} emptyMessage="No activity yet." caption="Activity by type" />
            </section>
            <section className="grid gap-3">
              <h2 className="text-lg font-semibold">Most active users</h2>
              <DataTable columns={userColumns} rows={stats.topUsers} rowKey={(u) => u.userId} emptyMessage="No users yet." caption="Most active users" />
            </section>
          </div>
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <DataTable columns={recentColumns} rows={stats.recentActivities} rowKey={(l) => String(l.id)} emptyMessage="No recent activity." caption="Recent activity" />
          </section>
        </div>
      )}
    </PageShell>
  );
}
