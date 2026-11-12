"use client";

import { useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { isSmsTurnedOff, useFeatureFlags } from "@/components/settings/FeatureFlagsProvider";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SmsResetDialog } from "./SmsResetDialog";

type Method = "EMAIL" | "SMS";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SMS_OFF_MESSAGE =
  "SMS verification is turned off right now. We can send the reset link by e-mail instead.";

export default function ForgotPasswordClient() {
  // SMS is offered only while the admin switch is on (read as off while loading).
  const { smsOtpEnabled, refresh: refreshFlags } = useFeatureFlags();
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<Method>("EMAIL");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  /** E-mail link requested: "check your e-mail" dialog. */
  const [sentTo, setSentTo] = useState<string | null>(null);
  /** SMS code requested: code + new password dialog. */
  const [smsFor, setSmsFor] = useState<string | null>(null);

  const via: Method = smsOtpEnabled ? method : "EMAIL";

  /** The server says SMS is off (403): fall back to e-mail and re-read the switch. */
  const smsTurnedOff = () => {
    setSmsFor(null);
    setMethod("EMAIL");
    setError(SMS_OFF_MESSAGE);
    void refreshFlags();
  };

  /** Asks for a link or a code; returns an error message to show, or null. */
  const request = async (address: string, how: Method): Promise<string | null> => {
    const opened = () => (how === "SMS" ? setSmsFor(address) : setSentTo(address));
    try {
      await api.post("/auth/forgotPassword", { email: address, verificationMethod: how });
      opened();
      return null;
    } catch (err) {
      if (how === "SMS" && isSmsTurnedOff(err)) {
        smsTurnedOff();
        return null;
      }
      const status = isAxiosError(err) ? err.response?.status : undefined;
      // Same answer whether or not the account exists (SEC-12): only rate
      // limits and server or network errors are shown as errors.
      if (status && status >= 400 && status < 500 && status !== 429) {
        opened();
        return null;
      }
      if (status === 429) {
        return getErrorMessage(err, "Too many requests. Please wait a few minutes and try again.");
      }
      return how === "SMS"
        ? "Could not send the code right now. Please try again."
        : "Could not send the reset link right now. Please try again.";
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const address = email.trim();
    if (!EMAIL_RE.test(address)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const problem = await request(address, via);
    setLoading(false);
    if (problem) setError(problem);
  };

  const resendSms = async () => {
    if (!smsFor) return;
    setResending(true);
    const problem = await request(smsFor, "SMS");
    setResending(false);
    if (problem) toast.error(problem);
    else if (smsOtpEnabled) toast.success("We sent a new code.");
  };

  return (
    <>
      <AuthCard
        title="Forgot password"
        description={
          smsOtpEnabled
            ? "We'll e-mail you a link or text you a code to reset it."
            : "We'll email you a link to reset it."
        }
        footer={
          <Link href="/login" className="text-link hover:underline">
            Back to log in
          </Link>
        }
      >
        <form onSubmit={handleRequest} className="grid gap-4" noValidate>
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}

          <FormField id="email" label="Email" required>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </FormField>

          {smsOtpEnabled ? (
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Send the reset via</legend>
              <RadioGroup value={via} onValueChange={(v) => setMethod(v as Method)} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="EMAIL" id="method-email" />
                  <Label htmlFor="method-email" className="font-normal">
                    Email
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="SMS" id="method-sms" />
                  <Label htmlFor="method-sms" className="font-normal">
                    SMS to my verified phone
                  </Label>
                </div>
              </RadioGroup>
            </fieldset>
          ) : null}

          <Button type="submit" className="w-full" loading={loading}>
            {via === "SMS" ? "Send code" : "Send reset link"}
          </Button>
        </form>
      </AuthCard>

      <Dialog open={Boolean(sentTo)} onOpenChange={(v) => !v && setSentTo(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Check your email</DialogTitle>
            <DialogDescription>
              If an account exists for{" "}
              <span className="font-medium text-foreground">{sentTo}</span>, we sent
              instructions to reset the password. The link expires in 5 minutes.
              Check your spam folder if nothing arrives.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSentTo(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SmsResetDialog
        email={smsFor}
        onClose={() => setSmsFor(null)}
        onResend={resendSms}
        resending={resending}
        onTurnedOff={smsTurnedOff}
      />
    </>
  );
}
