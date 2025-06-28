"use client";
import { useEffect, useState } from "react";
import api from "@/lib/authAxios";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type StatData = {
  totalLogs: number;
  countByType: Record<string, number>;
  countByDay: { date: string; count: string }[];
  topUsers: {
    userId: string;
    firstName: string;
    lastName: string;
    activityCount: string;
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

export default function ActivityLogsStatsPage() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/activity-logs/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black py-25 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-10">
        Activity Stats Dashboard
      </h1>
      {loading || !stats ? (
        <div className="flex items-center justify-center w-full py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        </div>
      ) : (
        <div className="w-full max-w-7xl flex flex-col gap-8">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-5 flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-400">
                  {stats.totalLogs}
                </span>
                <span className="text-neutral-400">Total Logs</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-400">
                  {stats.adminActions}
                </span>
                <span className="text-neutral-400">Admin Actions</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-400">
                  {stats.userActions}
                </span>
                <span className="text-neutral-400">User Actions</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-400">
                  {Object.keys(stats.countByType).length}
                </span>
                <span className="text-neutral-400">Types of Activities</span>
              </CardContent>
            </Card>
          </div>
          {/* Trend */}
          <div className="bg-neutral-900 rounded-xl p-6 shadow w-full">
            <h2 className="text-lg font-semibold text-white mb-4">
              Activity Trend (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.countByDay}>
                <XAxis dataKey="date" stroke="#fff" fontSize={12} />
                <YAxis stroke="#fff" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#222",
                    border: "none",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Activity Type Breakdown */}
          <div className="bg-neutral-900 rounded-xl p-6 shadow w-full">
            <h2 className="text-lg font-semibold text-white mb-4">
              Activity Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-neutral-300">Type</th>
                    <th className="px-3 py-2 text-neutral-300">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.countByType).map(([type, count]) => (
                    <tr key={type} className="border-t border-neutral-800">
                      <td className="px-3 py-2 text-neutral-100 font-mono">
                        {type}
                      </td>
                      <td className="px-3 py-2 text-neutral-100">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Top Users */}
          <div className="bg-neutral-900 rounded-xl p-6 shadow w-full">
            <h2 className="text-lg font-semibold text-white mb-4">
              Top 5 Most Active Users
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-neutral-300">#</th>
                    <th className="px-3 py-2 text-neutral-300">Name</th>
                    <th className="px-3 py-2 text-neutral-300">User ID</th>
                    <th className="px-3 py-2 text-neutral-300">
                      Activity Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topUsers.map((user, idx) => (
                    <tr
                      key={user.userId}
                      className="border-t border-neutral-800"
                    >
                      <td className="px-3 py-2 text-neutral-100">{idx + 1}</td>
                      <td className="px-3 py-2 text-neutral-100">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-3 py-2 text-neutral-100 font-mono">
                        {user.userId}
                      </td>
                      <td className="px-3 py-2 text-neutral-100">
                        {user.activityCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Recent Activities */}
          <div className="bg-neutral-900 rounded-xl p-6 shadow w-full">
            <h2 className="text-lg font-semibold text-white mb-4">
              Recent Activities
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-neutral-300">Date</th>
                    <th className="px-3 py-2 text-neutral-300">Type</th>
                    <th className="px-3 py-2 text-neutral-300">User</th>
                    <th className="px-3 py-2 text-neutral-300">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivities.map((log) => (
                    <tr key={log.id} className="border-t border-neutral-800">
                      <td className="px-3 py-2 text-neutral-100 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-neutral-100 font-mono">
                        {log.activity}
                      </td>
                      <td className="px-3 py-2 text-neutral-100">
                        {log.userFullName || (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-neutral-100">
                        {log.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
