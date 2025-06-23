"use client";
import { useEffect, useState } from "react";
import api from "@/lib/authAxios";
import { toast } from "react-hot-toast";

type Subscription = {
  id: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: string; // e.g. "Active (29 days remaining)" or "Expired"
  daysLeft: number;
  isActive: boolean;
  isCancelled: boolean;
  autoRenewal: boolean;
};

export default function SubscriptionDetailsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/subscriptions/subscriptionDetails");
      setSubscriptions(res.data);
    } catch {
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  // Handle cancel
  const handleCancel = (id: string) => {
    setCancelId(id);
    setConfirmOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelId) return;
    try {
      await api.post("/subscriptions/cancel", { subscriptionId: cancelId });
      toast.success("Subscription cancelled successfully!");
      fetchSubs();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Failed to cancel subscription."
      );
    } finally {
      setCancelId(null);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-25 px-2 font-sans">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Your Subscriptions
        </h1>

        {loading ? (
          <div className="text-center text-neutral-400 py-20">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center text-neutral-400 py-20">
            No subscription records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-neutral-900 border border-neutral-800 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-neutral-300">#</th>
                  <th className="px-4 py-2 text-left text-neutral-300">Plan</th>
                  <th className="px-4 py-2 text-left text-neutral-300">
                    Start Date
                  </th>
                  <th className="px-4 py-2 text-left text-neutral-300">
                    End Date
                  </th>
                  <th className="px-4 py-2 text-left text-neutral-300">
                    Days Left
                  </th>
                  <th className="px-4 py-2 text-left text-neutral-300">
                    Auto-Renewal
                  </th>
                  <th className="px-4 py-2 text-left text-neutral-300">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-neutral-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-t border-neutral-800 hover:bg-neutral-800/70 ${
                      s.isActive ? "bg-green-900/10" : "bg-red-900/10"
                    }`}
                  >
                    <td className="px-4 py-2 text-neutral-300">{i + 1}</td>
                    <td className="px-4 py-2 text-neutral-100 font-semibold">
                      {s.plan}
                    </td>
                    <td className="px-4 py-2 text-neutral-100">
                      {new Date(s.startDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-neutral-100">
                      {new Date(s.endDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-neutral-100">
                      {s.isActive ? s.daysLeft : 0}
                    </td>
                    <td className="px-4 py-2 text-neutral-100">
                      {s.autoRenewal ? (
                        <span className="px-2 py-1 rounded bg-green-800 text-green-200 text-xs">
                          On
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-red-800 text-red-200 text-xs">
                          Off
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        s.isActive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {s.status}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {s.autoRenewal ? (
                        <button
                          className="px-4 py-1 rounded bg-red-700 hover:bg-red-800 text-white transition"
                          onClick={() => handleCancel(s.id)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-neutral-900 p-8 rounded-lg shadow-xl text-center border border-neutral-700 max-w-xs">
              <h2 className="text-lg text-white mb-4 font-bold">
                Cancel Subscription?
              </h2>
              <p className="text-neutral-300 mb-6">
                Are you sure you want to cancel this subscription? This action
                cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-white"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
