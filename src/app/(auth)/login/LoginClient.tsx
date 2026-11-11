"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScanFace } from "lucide-react";
import api from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { LOGIN_NEXT_KEY, safeNextPath } from "@/lib/redirect";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const OAUTH_ERRORS: Record<string, string> = {
  google: "Google sign-in failed. Please try again.",
  google_inactive:
    "This account is inactive or blocked by an admin. Contact support for help.",
};

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Where to go after logging in (`/login?next=/checkout`); same-origin paths only.
  const [next, setNext] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // The backend redirects failed Google sign-ins here with ?error=<reason>
    // (and without our ?next), so fall back to the value saved before leaving.
    const reason = params.get("error");
    if (reason) setError(OAUTH_ERRORS[reason] ?? OAUTH_ERRORS.google);
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(LOGIN_NEXT_KEY);
    } catch {
      // storage blocked: ignore
    }
    setNext(safeNextPath(params.get("next") ?? (reason ? saved : null)));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.status === 200) {
        try {
          sessionStorage.removeItem(LOGIN_NEXT_KEY);
        } catch {
          // storage blocked: nothing to clear
        }
        // Full navigation so the server-rendered navbar picks up the session.
        window.location.href = next;
        return;
      }
      setError(res.data?.message || "Invalid login credentials.");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid login credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Log in"
      description="Welcome back to Elvate."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-link hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="grid gap-4" noValidate>
        {error ? <FormMessage variant="error">{error}</FormMessage> : null}
        <FormField id="email" label="Email" required>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </FormField>
        <FormField id="password" label="Password" required>
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormField>
        <Link
          href="/forgotPassword"
          className="-mt-2 justify-self-end text-sm text-link hover:underline"
        >
          Forgot your password?
        </Link>
        <Button type="submit" className="w-full" loading={loading}>
          Log in
        </Button>

        <div className="relative my-1">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
            or
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            // Google returns to /google, which reads this to continue to `next`.
            try {
              if (next !== "/") sessionStorage.setItem(LOGIN_NEXT_KEY, next);
              else sessionStorage.removeItem(LOGIN_NEXT_KEY);
            } catch {
              // storage blocked: the user lands on the home page instead
            }
            window.location.href = `${BACKEND_URL}/auth/google/login`;
          }}
        >
          <GoogleIcon className="size-4" />
          Continue with Google
        </Button>
        <Button asChild type="button" variant="secondary" className="w-full">
          <Link href={next !== "/" ? `/faceLogin?next=${encodeURIComponent(next)}` : "/faceLogin"}>
            <ScanFace aria-hidden="true" />
            Log in with your face
          </Link>
        </Button>
      </form>
    </AuthCard>
  );
}
