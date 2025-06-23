"use client";
import { useRouter } from "next/navigation";

export default function PaymentCancelPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 font-sans pt-24">
      <div className="bg-neutral-900/95 border border-neutral-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-2">
          Payment Cancelled
        </h2>
        <div className="mb-4 text-lg text-white font-semibold">
          Your payment was cancelled or failed.
        </div>
        <div className="mb-4 text-gray-300 text-sm">
          If you cancelled the payment by mistake or your payment failed, you
          can try subscribing again.
        </div>
        <button
          onClick={() => router.push("/subscription")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Subscribe Again
        </button>
      </div>
    </div>
  );
}
