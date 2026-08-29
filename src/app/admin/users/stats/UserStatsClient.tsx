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
import { PageShell } from "@/components/shared/PageShell";
import { FormMessage } from "@/components/forms/FormMessage";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatsSkeleton } from "@/components/admin/StatsSkeleton";
import { axisProps, CHART_COLORS, gridProps, legendProps, tooltipProps } from "@/components/admin/chart-theme";

type Stats = {
  total: number;
  active: number;
  emailVerified: number;
  phoneVerified: number;
  faceVerified: number;
  roleCounts: Record<string, number>;
  registrationTrend: { date: string; count: number | string }[];
};

const roleLabels: Record<string, string> = { ADMIN: "Admin", BUYER: "Buyer", SELLER: "Seller" };

export default function UserStatsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/users/userStats")
      .then((res) => !cancelled && setStats(res.data))
      .catch(() => !cancelled && setStats(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const rolePie = stats
    ? Object.entries(stats.roleCounts).map(([role, value]) => ({ name: roleLabels[role] ?? role, value }))
    : [];
  const trend = stats ? stats.registrationTrend.map((x) => ({ date: x.date, count: Number(x.count) })) : [];

  return (
    <PageShell width="xl" title="User statistics" description="Totals, verification coverage and registrations.">
      {loading ? (
        <StatsSkeleton cards={5} />
      ) : !stats ? (
        <FormMessage variant="error">No statistics available right now.</FormMessage>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total users" value={stats.total} accent={1} />
            <StatCard label="Active" value={stats.active} accent={2} />
            <StatCard label="Email verified" value={stats.emailVerified} accent={3} />
            <StatCard label="Phone verified" value={stats.phoneVerified} accent={4} />
            <StatCard label="Face verified" value={stats.faceVerified} accent={5} />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Users by role">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={rolePie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {rolePie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Legend {...legendProps} />
                  <Tooltip {...tooltipProps} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Registrations (last 7 days)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trend}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip {...tooltipProps} />
                  <Bar dataKey="count" name="New users" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </PageShell>
  );
}
