"use client";
import { useEffect, useState } from "react";
import api from "@/lib/authAxios";

type Subscription = {
  id: string;
  userId?: string | null;
  userName?: string | null;
  plan: "1m" | "6m" | "12m";
  isCancelled: boolean;
  startDate: string;
  endDate: string;
};

type SubscriptionsResponse = {
  subscriptions: Subscription[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const planLabels: Record<string, string> = {
  "1m": "1 Month",
  "6m": "6 Months",
  "12m": "12 Months",
};

export default function AllSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchSubs = async () => {
      setLoading(true);
      try {
        const res = await api.get<SubscriptionsResponse>(
          `/subscriptions/getAllSubscriptions?page=${page}&pageSize=${pageSize}`
        );
        if (!cancelled) {
          setSubs(res.data.subscriptions);
          setTotalPages(res.data.totalPages);
        }
      } catch {
        if (!cancelled) {
          setSubs([]);
          setTotalPages(1);
        }
      }
      if (!cancelled) setLoading(false);
    };
    fetchSubs();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  function isExpired(sub: Subscription) {
    return new Date(sub.endDate) < new Date();
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-25 px-2 font-sans">
      <div className="max-w-5xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            All Subscriptions
          </h1>
          <p className="text-neutral-400 text-sm">
            See all user subscriptions (plan, user, status).
          </p>
        </div>
        <div className="relative rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg overflow-hidden">
          {/* Spinner overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            </div>
          )}
          {subs.length === 0 && !loading ? (
            <div className="text-center text-neutral-400 py-20">
              No subscriptions found.
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-neutral-800 text-neutral-300">
                  <th className="px-4 py-3 text-center font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium">End Date</th>
                  <th className="px-4 py-3 text-left font-medium">Expired</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Auto-renew
                  </th>
                </tr>
              </thead>
              <tbody>
                {subs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-neutral-500"
                    >
                      No subscriptions found.
                    </td>
                  </tr>
                ) : (
                  subs.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={
                        "transition-colors " +
                        (idx % 2 === 0 ? "bg-neutral-900" : "bg-neutral-950") +
                        " hover:bg-neutral-800/70"
                      }
                    >
                      <td className="px-4 py-3 text-center text-neutral-400">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-4 py-3 text-neutral-100 font-semibold">
                        {s.userName || "-"}
                      </td>
                      <td className="px-4 py-3 text-neutral-100">
                        {planLabels[s.plan] || s.plan}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">
                        {new Date(s.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">
                        {new Date(s.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {isExpired(s) ? (
                          <span className="inline-block px-2 py-1 rounded bg-red-700 text-xs font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded bg-green-700 text-xs font-semibold">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {s.isCancelled ? (
                          <span className="inline-block px-2 py-1 rounded bg-yellow-700 text-xs font-semibold">
                            Off
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded bg-green-700 text-xs font-semibold">
                            On
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-neutral-400 text-sm">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="px-4 py-1 rounded bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
