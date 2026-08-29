"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";

export default function GoogleLoginClient() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown === 0) {
      router.replace("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <AuthCard title="Signed in with Google">
      <div className="grid gap-4 text-center">
        <FormMessage variant="success">
          Welcome! You are now logged in with your Google account.
        </FormMessage>
        <p className="text-sm text-muted-foreground">
          Taking you home in{" "}
          <span className="font-mono tabular-nums text-foreground">{countdown}</span>{" "}
          seconds…
        </p>
        <Button onClick={() => router.replace("/")}>Go to home now</Button>
      </div>
    </AuthCard>
  );
}
