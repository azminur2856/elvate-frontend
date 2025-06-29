"use client";
import api from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!token) {
      setMsg("Invalid or missing reset token.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== rePassword) {
      setMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.put("/auth/resetPassword", {
        verificationMethod: "EMAIL",
        resetTokenOrOTP: token,
        newPassword,
      });
      setMsg(res.data.message || "Password reset successful.");
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err: any) {
      setMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const isMismatch = rePassword.length > 0 && newPassword !== rePassword;

  return (
    <div className="min-h-screen flex items-center justify-center font-sans">
      <div className="bg-neutral-900/95 border border-neutral-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
          Reset Password
        </h2>
        <form onSubmit={handleReset} className="flex flex-col gap-3">
          <label className="block text-sm font-medium text-gray-200">
            New Password
            <input
              type="password"
              className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-200">
            Re-enter New Password
            <input
              type="password"
              className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              required
            />
            {isMismatch && (
              <span className="text-xs text-red-400 mt-1 block">
                Passwords do not match.
              </span>
            )}
          </label>
          <button
            type="submit"
            disabled={
              loading ||
              !newPassword ||
              !rePassword ||
              newPassword !== rePassword ||
              newPassword.length < 6
            }
            className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          {msg && (
            <p
              className={`text-center text-sm mt-2 ${
                msg.toLowerCase().includes("success")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {msg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
