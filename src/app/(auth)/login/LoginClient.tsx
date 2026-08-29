"use client";

import { useState } from "react";
import Link from "next/link";
import { ScanFace } from "lucide-react";
import api from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.status === 200) {
        window.location.href = "/";
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
            window.location.href = `${BACKEND_URL}/auth/google/login`;
          }}
        >
          <GoogleIcon className="size-4" />
          Continue with Google
        </Button>
        <Button asChild type="button" variant="secondary" className="w-full">
          <Link href="/faceLogin">
            <ScanFace aria-hidden="true" />
            Log in with your face
          </Link>
        </Button>
      </form>
    </AuthCard>
  );
}
