"use client";
import { useEffect, useState } from "react";
import api from "@/lib/authAxios";

type Payment = {
  id: string;
  userId?: string | null;
  userName?: string | null;
  amount: number;
  currency: string;
  invoiceUrl: string;
  paidAt: string;
};

type PaymentsResponse = {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function AllPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await api.get<PaymentsResponse>(
          `/subscriptions/getAllPayments?page=${page}&pageSize=${pageSize}`
        );
        if (!isCancelled) {
          setPayments(res.data.payments);
          setTotalPages(res.data.totalPages);
        }
      } catch {
        if (!isCancelled) {
          setPayments([]);
          setTotalPages(1);
        }
      }
      if (!isCancelled) setLoading(false);
    };
    fetchPayments();
    return () => {
      isCancelled = true;
    };
  }, [page, pageSize]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-25 px-2 font-sans">
      <div className="max-w-5xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">All Payments</h1>
          <p className="text-neutral-400 text-sm">
            See all user payments including invoice links.
          </p>
        </div>
        <div className="relative rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg overflow-hidden">
          {/* Spinner overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            </div>
          )}
          {payments.length === 0 && !loading ? (
            <div className="text-center text-neutral-400 py-20">
              No payments found.
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-neutral-800 text-neutral-300">
                  <th className="px-4 py-3 text-center font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Currency</th>
                  <th className="px-4 py-3 text-left font-medium">Paid At</th>
                  <th className="px-4 py-3 text-left font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-neutral-500"
                    >
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p, idx) => (
                    <tr
                      key={p.id}
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
                        {p.userName || "-"}
                      </td>
                      <td className="px-4 py-3 text-neutral-100 font-mono">
                        {p.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-neutral-100">
                        {p.currency.toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">
                        {new Date(p.paidAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={p.invoiceUrl}
                          className="text-blue-500 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Invoice
                        </a>
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
