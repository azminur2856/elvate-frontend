"use client";
import { useEffect, useState } from "react";
import api from "@/lib/authAxios";

type Payment = {
  id: string;
  amount: number | string; // Accept both, just in case
  currency: string;
  paidAt: string;
  invoiceUrl: string;
};

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/subscriptions/paymentsHistory");
        setPayments(res.data);
      } catch (err) {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-25 px-2 font-sans">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Payment History
        </h1>

        {loading ? (
          <div className="text-center text-neutral-400 py-20">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center text-neutral-400 py-20">
            No payment history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-neutral-900 border border-neutral-800 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-neutral-300">SL</th>
                  <th className="px-4 py-2 text-left text-neutral-300">Date</th>
                  <th className="px-4 py-2 text-left text-neutral-300">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-neutral-300">
                    Currency
                  </th>
                  <th className="px-4 py-2 text-left text-neutral-300">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="border-t border-neutral-800 hover:bg-neutral-800/70"
                  >
                    <td className="px-4 py-2 text-neutral-100">{idx + 1}</td>
                    <td className="px-4 py-2 text-neutral-100">
                      {new Date(p.paidAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-neutral-100">
                      {Number(p.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-neutral-100">
                      {p.currency.toUpperCase()}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded shadow transition text-sm"
                      >
                        View Invoice
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
