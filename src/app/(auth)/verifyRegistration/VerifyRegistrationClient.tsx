"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Status = "verifying" | "success" | "error";

export default function VerifyRegistrationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("Verifying your email…");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }
    api
      .get("/auth/verifyRegistration", { params: { token } })
      .then((res) => {
        setStatus("success");
        setMessage(res.data?.message || "Your account has been verified.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getErrorMessage(err, "Verification failed."));
      });
  }, [searchParams]);

  useEffect(() => {
    if (status === "verifying") return;
    if (countdown === 0) {
      router.replace(status === "success" ? "/login" : "/signup");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, status, router]);

  const title =
    status === "verifying"
      ? "Verifying your email"
      : status === "success"
      ? "Email verified"
      : "Verification failed";

  return (
    <AuthCard title={title}>
      <div className="grid gap-4 text-center">
        {status === "verifying" ? (
          <Spinner size="lg" label="Verifying your email" className="mx-auto" />
        ) : (
          <FormMessage variant={status}>{message}</FormMessage>
        )}
        {status !== "verifying" ? (
          <>
            <p className="text-sm text-muted-foreground">
              Redirecting in{" "}
              <span className="font-mono tabular-nums text-foreground">{countdown}</span>{" "}
              seconds…
            </p>
            <Button
              onClick={() => router.replace(status === "success" ? "/login" : "/signup")}
              variant={status === "success" ? "default" : "outline"}
            >
              {status === "success" ? "Go to log in now" : "Back to sign up"}
            </Button>
          </>
        ) : null}
      </div>
    </AuthCard>
  );
}
