"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

export default function VerifyRegistrationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying your email...");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    api
      .get("/auth/verifyRegistration", {
        params: { token },
      })
      .then((res) => {
        setStatus("success");
        setMessage(
          res.data?.message ||
            "Your account has been verified successfully! Redirecting to login..."
        );
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Verification failed."
        );
      });
  }, [searchParams]);

  useEffect(() => {
    if (status === "verifying") return;
    if (countdown === 0) {
      if (status === "success") router.replace("/login");
      else router.replace("/signup");
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, status, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-neutral-900/95 border border-neutral-800 shadow-2xl p-8 rounded-2xl w-full max-w-md text-center">
        <h2
          className={`text-2xl font-bold mb-4 ${
            status === "success"
              ? "text-green-400"
              : status === "error"
              ? "text-red-400"
              : "text-white"
          }`}
        >
          {status === "verifying"
            ? "Verifying Email..."
            : status === "success"
            ? "Verification Successful!"
            : "Verification Failed"}
        </h2>
        <p className="text-gray-200 mb-6">{message}</p>
        <div className="mb-4">
          {status === "verifying" ? (
            <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></span>
          ) : (
            <span>
              Redirecting in <span className="font-semibold">{countdown}</span>{" "}
              seconds...
            </span>
          )}
        </div>
        {status === "success" ? (
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
            onClick={() => router.replace("/login")}
          >
            Go to Login Now
          </button>
        ) : status === "error" ? (
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition"
            onClick={() => router.replace("/signup")}
          >
            Go to Signup
          </button>
        ) : null}
      </div>
    </div>
  );
}
