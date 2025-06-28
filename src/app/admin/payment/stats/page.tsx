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

type Payment = {
  id: string;
  userId?: string;
  userName?: string;
  amount: number;
  currency: string;
  invoiceUrl: string;
  paidAt: string;
};

type AmountByCurrency = {
  currency: string;
  count: number;
  sum: number;
};

type ByDay = {
  date: string;
  count: string;
  sum: string;
};

type PaymentStats = {
  totalPayments: number;
  totalAmount: number;
  amountByCurrency: AmountByCurrency[];
  byDay: ByDay[];
  recentPayments: Payment[];
};

const CURRENCY_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626"];

export default function PaymentStatsPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/subscriptions/paymentStats")
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Prepare bar chart data (payments per day)
  function getBarData() {
    if (!stats) return [];
    return stats.byDay.map((d) => ({
      date: d.date,
      count: Number(d.count),
      sum: Number(d.sum),
    }));
  }

  // Prepare pie chart data (by currency)
  function getPieData() {
    if (!stats) return [];
    return stats.amountByCurrency.map((c) => ({
      currency: c.currency.toUpperCase(),
      value: c.sum,
    }));
  }

  return (
    <div className="min-h-screen bg-black text-white py-25 px-2 flex flex-col items-center font-sans">
      <h1 className="text-3xl font-bold mb-8">Payment Statistics</h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <span className="text-neutral-300">Loading...</span>
        </div>
      ) : !stats ? (
        <div className="text-neutral-400">No payment stats available.</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
            <div className="bg-neutral-900 rounded-xl p-5 flex flex-col items-center border border-neutral-800 shadow">
              <span className="text-lg text-neutral-400 mb-1">
                Total Payments
              </span>
              <span className="text-3xl font-bold">{stats.totalPayments}</span>
            </div>
            <div className="bg-neutral-900 rounded-xl p-5 flex flex-col items-center border border-neutral-800 shadow">
              <span className="text-lg text-neutral-400 mb-1">
                Total Amount
              </span>
              <span className="text-3xl font-bold">
                {stats.totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="bg-neutral-900 rounded-xl p-5 flex flex-col items-center border border-neutral-800 shadow col-span-2 md:col-span-2">
              <span className="text-lg text-neutral-400 mb-1">Currencies</span>
              <span className="text-xl font-bold">
                {stats.amountByCurrency.map((c) => (
                  <span key={c.currency} className="mr-3">
                    {c.currency.toUpperCase()}: {c.sum}
                  </span>
                ))}
              </span>
            </div>
          </div>
          {/* Charts */}
          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 mb-10">
            {/* Bar Chart */}
            <div className="flex-1 bg-neutral-900 rounded-xl p-5 border border-neutral-800">
              <div className="mb-3 font-semibold text-lg">
                Payments per Day (last 7 days)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={getBarData()}>
                  <XAxis dataKey="date" stroke="#bbb" />
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
            <div className="flex-1 bg-neutral-900 rounded-xl p-5 border border-neutral-800">
              <div className="mb-3 font-semibold text-lg">
                Amount by Currency
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={getPieData()}
                    dataKey="value"
                    nameKey="currency"
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
                        fill={CURRENCY_COLORS[idx % CURRENCY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Recent Payments Table */}
          <div className="w-full max-w-4xl bg-neutral-900 rounded-lg border border-neutral-800 overflow-x-auto shadow">
            <div className="p-4 border-b border-neutral-800 font-semibold text-lg">
              Recent Payments
            </div>
            <table className="min-w-full">
              <thead>
                <tr className="bg-neutral-800 text-neutral-300">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Currency</th>
                  <th className="px-3 py-2 text-left">Paid At</th>
                  <th className="px-3 py-2 text-left">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-neutral-500 text-center py-6"
                    >
                      No recent payments.
                    </td>
                  </tr>
                ) : (
                  stats.recentPayments.map((p, idx) => (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-800/60 transition-colors"
                    >
                      <td className="px-3 py-2 text-neutral-400">{idx + 1}</td>
                      <td className="px-3 py-2">
                        {p.userName || (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {p.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-3 py-2">{p.currency.toUpperCase()}</td>
                      <td className="px-3 py-2 text-xs">
                        {new Date(p.paidAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <a
                          href={p.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Invoice
                        </a>
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
