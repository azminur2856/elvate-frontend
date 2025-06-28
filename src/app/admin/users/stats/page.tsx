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
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";

type Stats = {
  total: number;
  active: number;
  emailVerified: number;
  phoneVerified: number;
  faceVerified: number;
  roleCounts: Record<string, number>;
  registrationTrend: { date: string; count: string }[];
};

const roleLabels = {
  ADMIN: "Admin",
  BUYER: "Buyer",
  SELLER: "Seller",
} as const;

const pieColors = ["#2563eb", "#16a34a", "#d97706", "#e11d48"];

export default function UserStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/users/userStats")
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // For Pie Chart: User Roles
  function getRolePieData() {
    if (!stats) return [];
    return Object.entries(stats.roleCounts).map(([role, value]) => ({
      role,
      label: roleLabels[role as keyof typeof roleLabels] ?? role,
      value,
    }));
  }

  // For Bar Chart: Registration trend
  function getRegBarData() {
    return (
      stats?.registrationTrend.map((x) => ({
        ...x,
        count: Number(x.count),
      })) || []
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-25 px-2 flex flex-col items-center font-sans">
      <h1 className="text-3xl font-bold mb-8">User Stats</h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <span className="text-neutral-300">Loading...</span>
        </div>
      ) : !stats ? (
        <div className="text-neutral-400">No stats available.</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 w-full max-w-6xl">
            <StatCard label="Total Users" value={stats.total} />
            <StatCard label="Active" value={stats.active} />
            <StatCard label="Email Verified" value={stats.emailVerified} />
            <StatCard label="Phone Verified" value={stats.phoneVerified} />
            <StatCard label="Face Verified" value={stats.faceVerified} />
          </div>

          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Role Pie Chart */}
            <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow">
              <div className="mb-3 font-semibold text-lg">Users by Role</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={getRolePieData()}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {getRolePieData().map((_, idx) => (
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
            {/* Registration Trend Bar Chart */}
            <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow">
              <div className="text-lg font-semibold mb-3">
                Registrations (Last 7 Days)
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={getRegBarData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#bbb" />
                  <YAxis stroke="#bbb" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "none",
                      color: "#fff",
                    }}
                    cursor={{ fill: "#222" }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-5 flex flex-col items-center border border-neutral-800 shadow">
      <span className="text-lg text-neutral-400 mb-1">{label}</span>
      <span className="text-3xl font-bold">{value}</span>
    </div>
  );
}
