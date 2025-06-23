"use client";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import toast from "react-hot-toast";
import api from "@/lib/authAxios";

export default function PhoneVerificationModal({
  open,
  onClose,
  phone,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  phone: string;
  onVerified?: () => void; // callback after successful verify
}) {
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMsg, setOtpMsg] = useState<string | null>(null);
  const [otpError, setOtpError] = useState("");

  // Reset state when modal closes
  if (!open) {
    if (otpStep !== "request" || otp || otpMsg || otpError)
      setTimeout(() => {
        setOtpStep("request");
        setOtp("");
        setOtpMsg(null);
        setOtpError("");
      }, 250);
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-neutral-900 border border-neutral-800 p-7 rounded-2xl w-full max-w-sm relative">
        <button
          className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-100"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-3 text-center text-white">
          Phone Verification
        </h3>

        {otpStep === "request" ? (
          <>
            <p className="text-gray-300 mb-4 text-center">
              We’ll send a 6-digit OTP to your phone.
              <br />
              <span className="font-mono text-blue-400 text-sm">{phone}</span>
            </p>
            <button
              onClick={async () => {
                setOtpLoading(true);
                setOtpMsg(null);
                setOtpError("");
                try {
                  const res = await api.post(
                    "/auth/getOtpForPhoneVerification"
                  );
                  setOtpMsg(res.data.message);
                  setOtpStep("verify");
                  toast.success("OTP sent!");
                } catch (err: any) {
                  setOtpError(
                    err?.response?.data?.message ||
                      err?.response?.data?.error ||
                      err?.message ||
                      "Failed to send OTP"
                  );
                  toast.error("Failed to send OTP");
                } finally {
                  setOtpLoading(false);
                }
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-gray-700"
              disabled={otpLoading}
            >
              {otpLoading ? "Sending..." : "Send OTP"}
            </button>
            {otpMsg && (
              <div className="mt-2 text-green-400 text-sm text-center">
                {otpMsg}
              </div>
            )}
            {otpError && (
              <div className="mt-2 text-red-400 text-sm text-center">
                {otpError}
              </div>
            )}
          </>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setOtpLoading(true);
              setOtpError("");
              try {
                const res = await api.post("/auth/verifyPhone", { otp });
                toast.success(res.data.message || "Phone verified!");
                setOtp("");
                setOtpMsg(null);
                setOtpError("");
                setTimeout(() => {
                  if (onVerified) onVerified();
                  onClose();
                }, 600);
              } catch (err: any) {
                setOtpError(
                  err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Invalid OTP"
                );
                toast.error("Invalid or expired OTP");
              } finally {
                setOtpLoading(false);
              }
            }}
            className="flex flex-col gap-4 mt-3"
          >
            <label className="block text-gray-200 text-sm font-medium mb-2 text-center">
              Enter 6-digit OTP sent to your phone
            </label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              containerClassName="justify-center"
              className="border border-neutral-700 rounded-md bg-neutral-800 text-white"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
            >
              <InputOTPGroup>
                {[...Array(6)].map((_, idx) => (
                  <InputOTPSlot key={idx} index={idx} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {otpError && (
              <span className="text-xs text-red-400 mt-1 text-center">
                {otpError}
              </span>
            )}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition disabled:bg-gray-600"
              disabled={otp.length !== 6 || otpLoading}
            >
              {otpLoading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
