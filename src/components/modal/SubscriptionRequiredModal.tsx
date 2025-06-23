"use client";
import Link from "next/link";

export default function SubscriptionRequiredModal({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message?: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 max-w-sm w-full text-center text-white shadow-2xl relative">
        <button
          className="absolute right-4 top-3 text-2xl text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="text-3xl mb-3">🔒</div>
        <h2 className="text-xl font-bold mb-2">Subscription Required</h2>
        <div className="mb-4 text-gray-200 text-sm">
          {message || "You need an active subscription to use this feature."}
        </div>
        <Link
          href="/subscription"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition mt-2"
        >
          Go to Subscription Page
        </Link>
      </div>
    </div>
  );
}
