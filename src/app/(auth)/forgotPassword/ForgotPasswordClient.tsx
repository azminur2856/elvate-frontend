"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { AuthCard } from "@/components/auth/AuthCard";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Method = "EMAIL" | "SMS";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<Method>("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgotPassword", {
        email,
        verificationMethod: method,
      });
      setSentTo(email);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send the reset link."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthCard
        title="Forgot password"
        description="We'll email you a link to reset it."
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

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Send the reset via</legend>
            {/* SMS reset is not offered right now (no SMS credits in production).
                The backend route still exists; only the option is disabled. */}
            <RadioGroup
              value={method}
              onValueChange={(v) => setMethod(v as Method)}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="EMAIL" id="method-email" />
                <Label htmlFor="method-email" className="font-normal">
                  Email
                </Label>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RadioGroupItem value="SMS" id="method-sms" disabled />
                    <Label htmlFor="method-sms" className="font-normal">
                      SMS <span className="text-xs">(unavailable)</span>
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>SMS reset is currently unavailable.</TooltipContent>
              </Tooltip>
            </RadioGroup>
          </fieldset>

          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      </AuthCard>

      <Dialog open={Boolean(sentTo)} onOpenChange={(v) => !v && setSentTo(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Check your email</DialogTitle>
            <DialogDescription>
              We sent a password reset link to{" "}
              <span className="font-medium text-foreground">{sentTo}</span>. The
              link expires in 5 minutes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSentTo(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
