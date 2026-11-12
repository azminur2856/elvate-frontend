"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH, passwordProblem } from "@/lib/password";
import { isSmsTurnedOff } from "@/components/settings/FeatureFlagsProvider";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

type Props = {
  /** The e-mail the code was requested for; null = closed. */
  email: string | null;
  onClose: () => void;
  /** Ask for a new SMS code (same e-mail). */
  onResend: () => Promise<void>;
  resending: boolean;
  /** The server says SMS is switched off (403): fall back to e-mail. */
  onTurnedOff: () => void;
};

/**
 * Second step of an SMS reset: the 6-digit code plus the new password.
 * `PUT /auth/resetPassword` with `verificationMethod: "SMS"` must include
 * the e-mail (SEC-05), so a code only works for the account it was sent to.
 */
export function SmsResetDialog({ email, onClose, onResend, resending, onTurnedOff }: Props) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!email) {
      setOtp("");
      setNewPassword("");
      setRePassword("");
      setPasswordTouched(false);
      setError("");
    }
  }, [email]);

  const passwordError = newPassword ? passwordProblem(newPassword) : null;
  const mismatch = rePassword.length > 0 && newPassword !== rePassword;
  const ready = otp.length === 6 && newPassword && rePassword && !passwordError && !mismatch;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !ready) {
      setPasswordTouched(true);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.put("/auth/resetPassword", {
        verificationMethod: "SMS",
        resetTokenOrOTP: otp,
        newPassword,
        email,
      });
      toast.success("Password reset. Log in with your new password.");
      router.replace("/login");
    } catch (err) {
      if (isSmsTurnedOff(err)) {
        onTurnedOff();
        return;
      }
      setError(getErrorMessage(err, "Could not reset the password."));
    } finally {
      setSaving(false);
    }
  };

  const resend = async () => {
    setError("");
    setOtp("");
    await onResend();
  };

  return (
    <Dialog open={Boolean(email)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Enter the SMS code</DialogTitle>
          <DialogDescription>
            If an account with a verified phone exists for{" "}
            <span className="font-medium text-foreground">{email}</span>, we sent it a 6-digit code.
            The code expires in 2 minutes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}
          <div className="grid gap-2">
            <Label htmlFor="sms-code" className="justify-center">
              6-digit code
            </Label>
            <InputOTP
              id="sms-code"
              maxLength={6}
              value={otp}
              onChange={setOtp}
              containerClassName="justify-center"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              autoFocus
              aria-label="SMS code"
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <FormField
            id="sms-new-password"
            label="New password"
            hint={PASSWORD_HINT}
            error={passwordTouched ? passwordError : undefined}
            required
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              minLength={PASSWORD_MIN_LENGTH}
              required
            />
          </FormField>
          <FormField
            id="sms-re-password"
            label="Re-enter new password"
            error={mismatch ? "Passwords do not match." : undefined}
            required
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              required
            />
          </FormField>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="ghost" loading={resending} onClick={() => void resend()}>
              Send a new code
            </Button>
            <Button type="submit" loading={saving} disabled={!ready}>
              Reset password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
