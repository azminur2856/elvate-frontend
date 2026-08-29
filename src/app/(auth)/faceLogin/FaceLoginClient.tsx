"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScanFace } from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { StatusIndicator, type FaceStatus } from "@/components/shared/StatusIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FACE_API_SCRIPT =
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const FACE_API_MODELS = "https://justadudewhohacks.github.io/face-api.js/models";

type Result = { type: "success" | "error"; text: string } | null;

function stopVideoStream(video: HTMLVideoElement | null) {
  if (video?.srcObject) {
    (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    video.srcObject = null;
  }
}

export default function FaceLoginClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState<FaceStatus>("none");
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  // Load face-api.js (once) and its models.
  useEffect(() => {
    let cancelled = false;
    async function loadModels() {
      const faceapi = window.faceapi;
      if (!faceapi) return;
      await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODELS);
      await faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_MODELS);
      if (!cancelled) setModelsReady(true);
    }
    if (window.faceapi) {
      void loadModels();
    } else {
      const script = document.createElement("script");
      script.src = FACE_API_SCRIPT;
      script.async = true;
      script.onload = () => void loadModels();
      document.body.appendChild(script);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Camera.
  useEffect(() => {
    const video = videoRef.current;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (video) video.srcObject = stream;
      })
      .catch(() => setResult({ type: "error", text: "Cannot access the webcam." }));
    return () => stopVideoStream(video);
  }, []);

  // Live alignment feedback.
  useEffect(() => {
    if (!modelsReady) return;
    let busy = false;
    const detect = async () => {
      const faceapi = window.faceapi;
      if (busy || !faceapi || !videoRef.current) return;
      busy = true;
      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();
        if (!detection) {
          setStatus("none");
          return;
        }
        const leftEye = detection.landmarks.getLeftEye();
        const rightEye = detection.landmarks.getRightEye();
        const angle = Math.abs(
          Math.atan2(rightEye[0].y - leftEye[0].y, rightEye[0].x - leftEye[0].x) *
            (180 / Math.PI)
        );
        setStatus(angle < 10 ? "aligned" : angle < 25 ? "tilted" : "none");
      } finally {
        busy = false;
      }
    };
    const interval = setInterval(() => void detect(), 500);
    return () => clearInterval(interval);
  }, [modelsReady]);

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
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );
      if (!blob) throw new Error("Could not capture the camera frame.");

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
      setTimeout(() => {
        stopVideoStream(videoRef.current);
        router.push("/");
      }, 500);
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

        {result ? <FormMessage variant={result.type}>{result.text}</FormMessage> : null}

        <Button type="submit" className="w-full" loading={loading}>
          <ScanFace aria-hidden="true" />
          Log in with your face
        </Button>
      </form>
    </AuthCard>
  );
}
