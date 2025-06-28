"use client";
import { useEffect, useState } from "react";
import api from "@/lib/authAxios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// Colors
const pieColors = ["#2563eb", "#16a34a", "#d97706", "#a21caf", "#e11d48"];

type UserStats = {
  total: number;
  active: number;
  emailVerified: number;
  phoneVerified: number;
  faceVerified: number;
  roleCounts: Record<string, number>;
  registrationTrend: { date: string; count: number }[];
};

type SubStats = {
  totalSubscriptions: number;
  countByPlan: Record<string, number>;
  activeCount: number;
  cancelledCount: number;
  recentSubscriptions: {
    id: string;
    plan: "1m" | "6m" | "12m";
    isCancelled: boolean;
    startDate: string;
    endDate: string;
    userId?: string;
    userName?: string;
  }[];
};

type PaymentStats = {
  totalPayments: number;
  totalAmount: number;
  amountByCurrency: { currency: string; count: number; sum: number }[];
  byDay: { date: string; count: number; sum: number }[];
  recentPayments: {
    id: string;
    userId?: string;
    userName?: string;
    amount: number;
    currency: string;
    invoiceUrl: string;
    paidAt: string;
  }[];
};

type ActivityStats = {
  totalLogs: number;
  countByType: Record<string, number>;
  countByDay: { date: string; count: number }[];
  topUsers: {
    userId: string;
    firstName: string;
    lastName: string;
    activityCount: number;
  }[];
  recentActivities: {
    id: number;
    activity: string;
    description: string;
    createdAt: string;
    userId: string | null;
    userFullName: string | null;
  }[];
  adminActions: number;
  userActions: number;
};

const planLabels: Record<string, string> = {
  "1m": "1 Month",
  "6m": "6 Months",
  "12m": "12 Months",
};

export default function AdminDashboardPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [subStats, setSubStats] = useState<SubStats | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Fetch all stats on mount
  useEffect(() => {
    setLoading(true);
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
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div>
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-500 mb-4"></div>
          <div className="text-neutral-300 text-xl font-semibold"></div>
        </div>
      </div>
    );
  }

  // Chart data
  const userPieData = userStats
    ? Object.entries(userStats.roleCounts).map(([role, value]) => ({
        name: role,
        value,
      }))
    : [];

  const subPieData = subStats
    ? Object.entries(subStats.countByPlan).map(([k, v]) => ({
        name: planLabels[k] || k,
        value: v,
      }))
    : [];

  const paymentAreaData = paymentStats
    ? paymentStats.byDay.map((d) => ({
        date: d.date,
        count: d.count,
        sum: d.sum,
      }))
    : [];

  const activityBarData = activityStats
    ? Object.entries(activityStats.countByType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }))
    : [];

  // Cards
  return (
    <div className="min-h-screen bg-black py-25 px-3 flex flex-col items-center font-sans">
      <h1 className="text-4xl font-bold mb-8 text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-7xl mb-8">
        <StatsCard
          label="Total Users"
          value={userStats?.total ?? 0}
          color="blue"
        />
        <StatsCard
          label="Subscriptions"
          value={subStats?.totalSubscriptions ?? 0}
          color="green"
        />
        <StatsCard
          label="Payments"
          value={paymentStats?.totalPayments ?? 0}
          color="yellow"
        />
        <StatsCard
          label="Activity Logs"
          value={activityStats?.totalLogs ?? 0}
          color="violet"
        />
      </div>
      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-7xl mb-8">
        <ChartCard title="Users by Role">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={userPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {userPieData.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Subscriptions by Plan">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={subPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {subPieData.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payments (Last 7 Days)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={paymentAreaData}>
              <XAxis dataKey="date" stroke="#bbb" />
              <YAxis stroke="#bbb" allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sum"
                stroke="#16a34a"
                fill="#16a34a"
                fillOpacity={0.18}
                name="Total Amount"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top Activity Types">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityBarData}>
              <XAxis dataKey="type" stroke="#bbb" />
              <YAxis stroke="#bbb" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#a21caf" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl">
        <ChartCard title="User Registration Trend (7 days)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userStats?.registrationTrend || []}>
              <XAxis dataKey="date" stroke="#bbb" />
              <YAxis stroke="#bbb" allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.15}
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payments by Currency">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paymentStats?.amountByCurrency || []}>
              <XAxis dataKey="currency" stroke="#bbb" />
              <YAxis stroke="#bbb" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="sum" fill="#d97706" name="Total Paid" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// Simple stat card
function StatsCard({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: number;
  color?: "blue" | "green" | "yellow" | "violet";
}) {
  const colors: any = {
    blue: "from-blue-700 to-blue-500 text-blue-200",
    green: "from-green-700 to-green-500 text-green-200",
    yellow: "from-yellow-700 to-yellow-500 text-yellow-200",
    violet: "from-violet-700 to-violet-500 text-violet-200",
  };
  return (
    <div
      className={`rounded-xl p-6 shadow border border-neutral-800 bg-gradient-to-tr ${colors[color]} flex flex-col items-center`}
    >
      <div className="text-lg font-medium mb-1">{label}</div>
      <div className="text-4xl font-bold">{value}</div>
    </div>
  );
}

// Chart card with shadow, title
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow flex flex-col items-center">
      <div className="mb-3 font-semibold text-lg">{title}</div>
      {children}
    </div>
  );
}
