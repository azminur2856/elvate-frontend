"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
  firstName: "",
  lastName: "",
  dob: "",
  email: "",
  phone: "",
  password: "",
  rePassword: "",
  terms: false,
};

type FormState = typeof initialState;

export default function SignupClient() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (name: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    set(e.target.name as keyof FormState, e.target.value);

  const mismatch =
    form.password.length > 0 &&
    form.rePassword.length > 0 &&
    form.password !== form.rePassword;

  const canSubmit =
    form.firstName &&
    form.email &&
    form.password &&
    form.rePassword &&
    form.terms &&
    !mismatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.terms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }
    if (form.password !== form.rePassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rePassword, terms, ...payload } = form;
      const res = await api.post("/users/createUser", {
        ...payload,
        dob: form.dob || undefined,
        phone: form.phone || undefined,
      });
      setSuccess(res.data?.message || "Registration successful. Check your email.");
      setForm(initialState);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthCard
        title="Create an account"
        description="Join Elvate to use the digital tools and shop."
        footer={
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-link hover:underline">
              Log in
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="firstName" label="First name" required>
              <Input
                name="firstName"
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField id="lastName" label="Last name">
              <Input
                name="lastName"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <FormField id="email" label="Email" required>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="phone" label="Phone" hint="Optional">
              <Input
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={handleChange}
              />
            </FormField>
            <FormField id="dob" label="Date of birth" hint="Optional">
              <Input
                name="dob"
                type="date"
                autoComplete="bday"
                value={form.dob}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <FormField id="password" label="Password" required>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField
            id="rePassword"
            label="Re-enter password"
            error={mismatch ? "Passwords do not match." : undefined}
            required
          >
            <Input
              name="rePassword"
              type="password"
              autoComplete="new-password"
              value={form.rePassword}
              onChange={handleChange}
              required
            />
          </FormField>

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={form.terms}
              onCheckedChange={(v) => set("terms", v === true)}
              aria-required
            />
            <p className="text-sm leading-snug">
              <Label htmlFor="terms" className="inline font-normal">
                I agree to the
              </Label>{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline"
              >
                Terms &amp; Conditions
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!canSubmit}
          >
            Create account
          </Button>
        </form>
      </AuthCard>

      <AlertDialog open={Boolean(success)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account created</AlertDialogTitle>
            <AlertDialogDescription>{success}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push("/login")}>
              Go to login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
