"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
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
import { formatMoney, PLAN_LABELS } from "@/lib/format";
import { PageShell } from "@/components/shared/PageShell";
import { FormMessage } from "@/components/forms/FormMessage";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatCard } from "@/components/admin/StatCard";
import { StatsSkeleton } from "@/components/admin/StatsSkeleton";
import { axisProps, CHART_COLORS, gridProps, legendProps, tooltipProps } from "@/components/admin/chart-theme";

type UserStats = {
  total: number;
  active: number;
  roleCounts: Record<string, number>;
  registrationTrend: { date: string; count: number | string }[];
};
type SubStats = { totalSubscriptions: number; countByPlan: Record<string, number> };
type PaymentStats = {
  totalPayments: number;
  totalAmount: number;
  amountByCurrency: { currency: string; count: number; sum: number }[];
  byDay: { date: string; count: number | string; sum: number | string }[];
};
type ActivityStats = { totalLogs: number; countByType: Record<string, number> };

export default function DashboardClient() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [subStats, setSubStats] = useState<SubStats | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/users/userStats"),
      api.get("/subscriptions/subStats"),
      api.get("/subscriptions/paymentStats"),
      api.get("/activity-logs/stats"),
    ])
      .then(([u, s, p, a]) => {
        setUserStats(u.data);
        setSubStats(s.data);
        setPaymentStats(p.data);
        setActivityStats(a.data);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const userPie = userStats
    ? Object.entries(userStats.roleCounts).map(([name, value]) => ({ name, value }))
    : [];
  const subPie = subStats
    ? Object.entries(subStats.countByPlan).map(([k, value]) => ({ name: PLAN_LABELS[k] ?? k, value }))
    : [];
  const paymentArea = paymentStats
    ? paymentStats.byDay.map((d) => ({ date: d.date, count: Number(d.count), sum: Number(d.sum) }))
    : [];
  const registration = userStats
    ? userStats.registrationTrend.map((d) => ({ date: d.date, count: Number(d.count) }))
    : [];
  const activityBar = activityStats
    ? Object.entries(activityStats.countByType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }))
    : [];

  return (
    <PageShell width="xl" title="Admin dashboard" description="An overview of users, subscriptions, payments and activity.">
      {loading ? (
        <StatsSkeleton label="Loading dashboard" />
      ) : failed ? (
        <FormMessage variant="error">Could not load the dashboard data. Try refreshing the page.</FormMessage>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total users" value={userStats?.total ?? 0} accent={1} hint={`${userStats?.active ?? 0} active`} />
            <StatCard label="Subscriptions" value={subStats?.totalSubscriptions ?? 0} accent={2} />
            <StatCard label="Payments" value={paymentStats?.totalPayments ?? 0} accent={3} hint={`${formatMoney(paymentStats?.totalAmount)} total`} />
            <StatCard label="Activity logs" value={activityStats?.totalLogs ?? 0} accent={4} />
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <ChartCard title="Users by role">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={userPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} label>
                    {userPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Legend {...legendProps} />
                  <Tooltip {...tooltipProps} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Subscriptions by plan">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={subPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} label>
                    {subPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Legend {...legendProps} />
                  <Tooltip {...tooltipProps} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Payments (last 7 days)">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={paymentArea}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip {...tooltipProps} />
                  <Area type="monotone" dataKey="sum" name="Total amount" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.18} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Top activity types">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={activityBar}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="type" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip {...tooltipProps} />
                  <Bar dataKey="count" name="Count" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="User registrations (last 7 days)">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={registration}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip {...tooltipProps} />
                  <Area type="monotone" dataKey="count" name="New users" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Payments by currency">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={paymentStats?.amountByCurrency ?? []}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="currency" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip {...tooltipProps} />
                  <Bar dataKey="sum" name="Total paid" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </PageShell>
  );
}
