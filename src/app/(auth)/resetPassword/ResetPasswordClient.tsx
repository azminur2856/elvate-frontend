"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = { type: "success" | "error"; text: string } | null;

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);

  const mismatch = rePassword.length > 0 && newPassword !== rePassword;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!token) {
      setStatus({ type: "error", text: "This reset link is invalid or missing its token." });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== rePassword) {
      setStatus({ type: "error", text: "Passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      const res = await api.put("/auth/resetPassword", {
        verificationMethod: "EMAIL",
        resetTokenOrOTP: token,
        newPassword,
      });
      setStatus({
        type: "success",
        text: res.data?.message || "Password reset. Redirecting to log in…",
      });
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      setStatus({ type: "error", text: getErrorMessage(err, "Could not reset the password.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset password"
      description="Choose a new password for your account."
      footer={
        <Link href="/login" className="text-link hover:underline">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleReset} className="grid gap-4" noValidate>
        {status ? <FormMessage variant={status.type}>{status.text}</FormMessage> : null}
        <FormField id="new-password" label="New password" hint="At least 6 characters." required>
          <Input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </FormField>
        <FormField
          id="re-password"
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
        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={!newPassword || !rePassword || mismatch || newPassword.length < 6}
        >
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
}
