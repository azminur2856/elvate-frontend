"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScanFace } from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { captureFrame, useFaceAlignment } from "@/hooks/useFaceAlignment";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Result = { type: "success" | "error"; text: string } | null;

export default function FaceLoginClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, cameraError } = useFaceAlignment(videoRef, true);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setEmailError("");
    if (!email) {
      setEmailError("Email is required.");
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    try {
      const blob = await captureFrame(video);
      const formData = new FormData();
      formData.append("email", email);
      formData.append("liveImage", blob, "live.jpg");
      const res = await api.post("/auth/login-with-face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.verified) {
        setResult({ type: "error", text: res.data?.message || "Login failed." });
        return;
      }
      setResult({ type: "success", text: res.data.message || "Logged in." });
      setTimeout(() => router.push("/"), 500);
    } catch (err) {
      setResult({ type: "error", text: getErrorMessage(err, "Face login failed.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Face login"
      description="Enter your email, align your face, then log in."
      footer={
        <Link href="/login" className="text-link hover:underline">
          Use password instead
        </Link>
      }
    >
      <form onSubmit={handleLogin} className="grid gap-4" noValidate>
        <FormField id="email" label="Email" error={emailError} required>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </FormField>

        <div className="mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-full bg-muted ring-4 ring-primary/40">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            aria-label="Live camera preview"
            className="size-full object-cover"
          />
        </div>
        <StatusIndicator status={status} />

        {cameraError ? (
          <FormMessage variant="error">
            Cannot access the webcam. Allow camera access and reload the page.
          </FormMessage>
        ) : null}
        {result ? <FormMessage variant={result.type}>{result.text}</FormMessage> : null}

        <Button type="submit" className="w-full" loading={loading}>
          <ScanFace aria-hidden="true" />
          Log in with your face
        </Button>
      </form>
    </AuthCard>
  );
}
