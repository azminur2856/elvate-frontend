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
} from "recharts";

type RecentSub = {
  id: string;
  plan: "1m" | "6m" | "12m";
  isCancelled: boolean;
  startDate: string;
  endDate: string;
  userId?: string;
  userName?: string;
};

type SubStats = {
  totalSubscriptions: number;
  countByPlan: { [key: string]: number };
  activeCount: number;
  cancelledCount: number;
  recentSubscriptions: RecentSub[];
};

const planLabels: Record<string, string> = {
  "1m": "1 Month",
  "6m": "6 Months",
  "12m": "12 Months",
};

const pieColors = ["#2563eb", "#16a34a", "#d97706"];

export default function SubscriptionStatsPage() {
  const [stats, setStats] = useState<SubStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/subscriptions/subStats")
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function isExpired(sub: RecentSub) {
    return new Date(sub.endDate) < new Date();
  }

  // For Bar Chart: Active, Cancelled, Expired
  function getBarData() {
    if (!stats) return [];
    let expired = 0;
    let active = 0;
    let cancelled = 0;
    stats.recentSubscriptions.forEach((sub) => {
      if (isExpired(sub)) expired++;
      else if (sub.isCancelled) cancelled++;
      else active++;
    });
    return [
      { status: "Active", count: active },
      { status: "Auto-renew Off", count: cancelled },
      { status: "Expired", count: expired },
    ];
  }

  // For Pie Chart: Plan Types
  function getPieData() {
    if (!stats) return [];
    return Object.entries(stats.countByPlan).map(([k, v]) => ({
      plan: planLabels[k] || k,
      value: v,
    }));
  }

  // Badge
  function getStatus(sub: RecentSub) {
    if (isExpired(sub))
      return (
        <span className="inline-block px-2 py-1 rounded bg-neutral-700 text-red-400 text-xs font-semibold">
          Expired
        </span>
      );
    if (sub.isCancelled)
      return (
        <span className="inline-block px-2 py-1 rounded bg-yellow-600 text-xs font-semibold">
          Auto-renew Off
        </span>
      );
    return (
      <span className="inline-block px-2 py-1 rounded bg-green-600 text-xs font-semibold">
        Active
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-25 px-2 flex flex-col items-center font-sans">
      <h1 className="text-3xl font-bold mb-8">Subscription Stats</h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <span className="text-neutral-300">Loading...</span>
        </div>
      ) : !stats ? (
        <div className="text-neutral-400">No stats available.</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
            <div className="bg-neutral-900 rounded-xl p-5 flex flex-col items-center border border-neutral-800 shadow">
              <span className="text-lg text-neutral-400 mb-1">Total</span>
              <span className="text-3xl font-bold">
                {stats.totalSubscriptions}
              </span>
            </div>
            <div className="bg-neutral-900 rounded-xl p-5 flex flex-col items-center border border-neutral-800 shadow">
              <span className="text-lg text-neutral-400 mb-1">Active</span>
              <span className="text-3xl font-bold">{stats.activeCount}</span>
            </div>
            <div className="bg-neutral-900 rounded-xl p-5 flex flex-col items-center border border-neutral-800 shadow">
              <span className="text-lg text-neutral-400 mb-1">Cancelled</span>
              <span className="text-3xl font-bold">{stats.cancelledCount}</span>
            </div>
            <div className="bg-neutral-900 rounded-xl p-5 flex flex-col items-center border border-neutral-800 shadow">
              <span className="text-lg text-neutral-400 mb-1">Plans</span>
              <span className="text-xl font-bold">
                {Object.entries(stats.countByPlan)
                  .map(([k, v]) => `${planLabels[k] ?? k}: ${v}`)
                  .join(", ")}
              </span>
            </div>
          </div>
          {/* Charts */}
          <div className="w-full max-w-4xl grid grid-cols-1  gap-8 mb-10">
            {/* Bar Chart */}
            <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow min-h-[320px]">
              <div className="mb-3 font-semibold text-lg">
                Recent Subscription Status
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={getBarData()}>
                  <XAxis dataKey="status" stroke="#bbb" />
                  <YAxis stroke="#bbb" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Pie Chart */}
            <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow min-h-[320px]">
              <div className="mb-3 font-semibold text-lg">
                Subscriptions by Plan
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={getPieData()}
                    dataKey="value"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} (${(
                        (typeof percent === "number" ? percent : 0) * 100
                      ).toFixed(0)}%)`
                    }
                  >
                    {getPieData().map((_, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={pieColors[idx % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Recent Subscriptions Table */}
          <div className="w-full max-w-4xl bg-neutral-900 rounded-lg border border-neutral-800 overflow-x-auto shadow">
            <div className="p-4 border-b border-neutral-800 font-semibold text-lg">
              Recent Subscriptions
            </div>
            <table className="min-w-full">
              <thead>
                <tr className="bg-neutral-800 text-neutral-300">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Plan</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Expired</th>
                  <th className="px-3 py-2 text-left">Start Date</th>
                  <th className="px-3 py-2 text-left">End Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSubscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-neutral-500 text-center py-6"
                    >
                      No recent subscriptions.
                    </td>
                  </tr>
                ) : (
                  stats.recentSubscriptions.map((sub, idx) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-neutral-800/60 transition-colors"
                    >
                      <td className="px-3 py-2 text-neutral-400">{idx + 1}</td>
                      <td className="px-3 py-2">
                        {sub.userName || (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {planLabels[sub.plan] || sub.plan}
                      </td>
                      <td className="px-3 py-2">{getStatus(sub)}</td>
                      <td className="px-3 py-2">
                        {isExpired(sub) ? (
                          <span className="inline-block px-2 py-1 rounded bg-red-700 text-xs font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded bg-green-700 text-xs font-semibold">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
