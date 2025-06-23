"use client";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type VerificationMethod = "EMAIL" | "SMS";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<VerificationMethod>("EMAIL");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMsg, setRequestMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Step 2 (SMS): Modal state
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [passwordMatchError, setPasswordMatchError] = useState("");

  // --- Step 1: Request forgot password ---
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestMsg(null);
    setRequestLoading(true);
    try {
      const res = await api.post("/auth/forgotPassword", {
        email,
        verificationMethod: method,
      });
      setRequestMsg(res.data?.message);
      if (res.status === 201 || res.status === 200) setShowModal(true);
    } catch (err: any) {
      setRequestMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // --- Step 2 (SMS): Reset password with OTP ---
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg(null);
    if (!otp || otp.length !== 6) {
      setResetMsg("Please enter the 6-digit OTP.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== rePassword) {
      setResetMsg("Passwords do not match.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await api.put("/auth/resetPassword", {
        verificationMethod: "SMS",
        resetTokenOrOTP: otp,
        newPassword,
      });
      setResetMsg(res.data?.message || "Password reset successful.");
      if (res.status === 201 || res.status === 200) {
        setTimeout(() => {
          setShowModal(false);
          router.replace("/login");
        }, 1200);
      }
    } catch (err: any) {
      setResetMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong."
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Realtime password match validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (rePassword && e.target.value !== rePassword) {
      setPasswordMatchError("Passwords do not match.");
    } else {
      setPasswordMatchError("");
    }
  };
  const handleRePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRePassword(e.target.value);
    if (newPassword && e.target.value !== newPassword) {
      setPasswordMatchError("Passwords do not match.");
    } else {
      setPasswordMatchError("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-centerfont-sans">
      <div className="bg-neutral-900/95 border border-neutral-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
          Forgot Password
        </h2>
        <form onSubmit={handleRequest} className="flex flex-col gap-3">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Email
            <input
              type="email"
              className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <div className="flex gap-6 items-center mt-1 mb-1">
            <label className="flex items-center text-gray-200">
              <input
                type="radio"
                name="method"
                value="EMAIL"
                checked={method === "EMAIL"}
                onChange={() => setMethod("EMAIL")}
                className="mr-1 accent-blue-600"
              />
              <span>Email</span>
            </label>
            <label className="flex items-center text-gray-200">
              <input
                type="radio"
                name="method"
                value="SMS"
                checked={method === "SMS"}
                onChange={() => setMethod("SMS")}
                className="mr-1 accent-blue-600"
              />
              <span>SMS</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={requestLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            {requestLoading
              ? "Sending..."
              : method === "SMS"
              ? "Send Reset OTP"
              : "Send Reset Link"}
          </button>
          {requestMsg && (
            <p className="text-center text-sm mt-2 text-blue-400">
              {requestMsg}
            </p>
          )}
        </form>
      </div>

      {/* Modal for EMAIL method */}
      {showModal && method === "EMAIL" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-neutral-900 p-6 rounded-lg shadow-lg w-full max-w-sm relative animate-fade-in border border-neutral-800">
            <button
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-100"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-3 text-center text-white">
              Check Your Email
            </h3>
            <p className="text-gray-300 mb-3 text-center">
              We've sent a password reset link to your email.
              <br />
              Click the link in your email to reset your password.
              <br />
              <span className="block mt-2 text-blue-400 font-mono text-xs">
                {email}
              </span>
            </p>
            <button
              className="w-full mt-2 bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              onClick={() => setShowModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal for SMS method */}
      {showModal && method === "SMS" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-neutral-900 p-6 rounded-lg shadow-lg w-full max-w-sm relative animate-fade-in border border-neutral-800">
            <button
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-100"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-3 text-center text-white">
              Reset Password (SMS)
            </h3>
            <form onSubmit={handleReset} className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-gray-200">
                Enter OTP from SMS
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  type="number"
                  containerClassName="justify-center my-2"
                  className="border border-neutral-700 rounded-md bg-neutral-800 text-white"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </label>

              <label className="block text-sm font-medium text-gray-200">
                New Password
                <input
                  type="password"
                  className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-gray-200">
                Re-enter New Password
                <input
                  type="password"
                  className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
                  value={rePassword}
                  onChange={handleRePasswordChange}
                  required
                />
                {passwordMatchError && (
                  <span className="text-xs text-red-400 mt-1">
                    {passwordMatchError}
                  </span>
                )}
              </label>
              <button
                type="submit"
                disabled={
                  resetLoading ||
                  !otp ||
                  otp.length !== 6 ||
                  !newPassword ||
                  !rePassword ||
                  newPassword !== rePassword
                }
                className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition disabled:bg-gray-600"
              >
                {resetLoading ? "Resetting..." : "Reset Password"}
              </button>
              {resetMsg && (
                <p
                  className={`text-center text-sm mt-2 ${
                    resetMsg.toLowerCase().includes("success")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {resetMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
