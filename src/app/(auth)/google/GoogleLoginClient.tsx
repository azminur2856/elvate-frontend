"use client";

import { useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { afterLoginTarget, LOGIN_NEXT_KEY, safeNextPath } from "@/lib/redirect";

export default function GoogleLoginClient() {
  const [countdown, setCountdown] = useState(3);
  // Saved by the login page before leaving for Google (`/login?next=…`).
  const [next, setNext] = useState("/");

  useEffect(() => {
    try {
      setNext(safeNextPath(sessionStorage.getItem(LOGIN_NEXT_KEY)));
      sessionStorage.removeItem(LOGIN_NEXT_KEY);
    } catch {
      // storage blocked: go home
    }
  }, []);

  // Full navigation so the server-rendered navbar picks up the new session.
  const go = () => window.location.replace(afterLoginTarget(next));

  useEffect(() => {
    if (countdown === 0) {
      window.location.replace(afterLoginTarget(next));
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, next]);

  const goingHome = next === "/";

  return (
    <AuthCard title="Signed in with Google">
      <div className="grid gap-4 text-center">
        <FormMessage variant="success">
          Welcome! You are now logged in with your Google account.
        </FormMessage>
        <p className="text-sm text-muted-foreground">
          {goingHome ? "Taking you home in" : "Taking you back in"}{" "}
          <span className="font-mono tabular-nums text-foreground">{countdown}</span>{" "}
          seconds…
        </p>
        <Button onClick={go}>{goingHome ? "Go to home now" : "Continue now"}</Button>
      </div>
    </AuthCard>
  );
}
