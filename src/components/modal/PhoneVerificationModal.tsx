"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { FormMessage } from "@/components/forms/FormMessage";

type Props = {
  open: boolean;
  onClose: () => void;
  phone: string;
  /** Called after a successful verification. */
  onVerified?: () => void;
};

export default function PhoneVerificationModal({
  open,
  onClose,
  phone,
  onVerified,
}: Props) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Reset when the dialog closes (previously done inside render via setTimeout).
  useEffect(() => {
    if (!open) {
      setStep("request");
      setOtp("");
      setInfo(null);
      setError("");
      setLoading(false);
    }
  }, [open]);

  const requestOtp = async () => {
    setLoading(true);
    setInfo(null);
    setError("");
    try {
      const res = await api.post("/auth/getOtpForPhoneVerification");
      setInfo(res.data?.message ?? "OTP sent.");
      setStep("verify");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send OTP."));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/verifyPhone", { otp });
      toast.success(res.data?.message || "Phone verified.");
      onVerified?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Invalid or expired OTP."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Phone verification</DialogTitle>
          <DialogDescription>
            We&apos;ll send a 6-digit code to{" "}
            <span className="font-mono tabular-nums text-foreground">{phone}</span>.
          </DialogDescription>
        </DialogHeader>

        {step === "request" ? (
          <div className="grid gap-3">
            {error ? <FormMessage variant="error">{error}</FormMessage> : null}
            <Button className="w-full" loading={loading} onClick={requestOtp}>
              Send code
            </Button>
          </div>
        ) : (
          <form onSubmit={verifyOtp} className="grid gap-4">
            {info ? <FormMessage variant="success">{info}</FormMessage> : null}
            <div className="grid gap-2">
              <Label htmlFor="otp" className="justify-center">
                Enter the 6-digit code
              </Label>
              <InputOTP
                id="otp"
                maxLength={6}
                value={otp}
                onChange={setOtp}
                containerClassName="justify-center"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                aria-label="One-time code"
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <InputOTPSlot key={idx} index={idx} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error ? <FormMessage variant="error">{error}</FormMessage> : null}
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={otp.length !== 6}
            >
              Verify
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={requestOtp}
              disabled={loading}
            >
              Resend code
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
