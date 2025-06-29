// src/app/payment/success/PaymentSuccessClient.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/authAxios";

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found.");
      setLoading(false);
      return;
    }
    api
      .get(`/subscriptions/session/${sessionId}`)
      .then((res) => {
        setSession(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch payment details."
        );
        setLoading(false);
      });
  }, [sessionId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        Checking payment...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-red-400">
        {error}
      </div>
    );
  if (!session) return null;

  const invoiceUrl =
    session.invoice?.hosted_invoice_url ||
    session.invoice_url ||
    session.invoice_pdf;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 font-sans pt-24">
      <div className="bg-neutral-900/95 border border-neutral-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-green-400 mb-2">
          Payment Successful!
        </h2>
        <div className="mb-4 text-lg text-white font-semibold">
          Thank you for your subscription.
        </div>
        <div className="mb-4 text-gray-300 text-sm">
          <strong>Amount Paid:</strong>{" "}
          {session.amount_total
            ? `${session.amount_total / 100} ${session.currency?.toUpperCase()}`
            : "N/A"}
        </div>
        <div className="mb-4 text-gray-300 text-sm">
          <strong>Plan:</strong>{" "}
          {session.metadata?.plan === "1m"
            ? "1 Month"
            : session.metadata?.plan === "6m"
            ? "6 Months"
            : session.metadata?.plan === "12m"
            ? "12 Months"
            : "N/A"}
        </div>
        <div className="mb-6">
          {invoiceUrl && (
            <Link
              href={invoiceUrl}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Invoice
            </Link>
          )}
        </div>
        <button
          onClick={() => router.push("/digitalServices")}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Go to Digital Services
        </button>
      </div>
    </div>
  );
}
