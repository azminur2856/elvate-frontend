"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { ScanFace } from "lucide-react";
import api from "@/lib/api";
import { getErrorMessage, retryAfterMinutes } from "@/lib/errors";
import { didAction, isFrontal, type FaceMetrics } from "@/lib/face-metrics";
import { afterLoginTarget, safeNextPath } from "@/lib/redirect";
import { canvasToJpeg, captureFrame, useFaceAlignment, type FaceFrame } from "@/hooks/useFaceAlignment";
import { FACE_FIRST_TIME_HINT, FACE_LOGIN_FAILED_MESSAGE, type FaceAction, type FaceChallenge } from "@/types/face";
import { AuthCard } from "@/components/auth/AuthCard";
import { isFaceLoginTurnedOff, useFeatureFlags } from "@/components/settings/FeatureFlagsProvider";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { StatusIndicator } from "@/components/shared/StatusIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** How long to wait for each shot before giving up (ms). */
const FIRST_SHOT_TIMEOUT = 5000;
const SECOND_SHOT_TIMEOUT = 7000;
/** Without face-api (script blocked): timed shots instead (ms). */
const TIMED_SECOND_SHOT = 2500;

const ACTION_CUE: Record<FaceAction, string> = {
  BLINK: "Now close your eyes for a moment",
  TURN_HEAD: "Now turn your head to one side",
};

type Phase = "email" | "ready" | "first" | "second" | "sending" | "done";
type Message = { type: "success" | "error" | "info"; text: string } | null;
type Shot = { blob: Blob; metrics: FaceMetrics | null };

/** Short beep so someone with closed eyes knows the photo was taken. */
function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    osc.onended = () => void ctx.close();
  } catch {
    /* no audio: the screen still says it */
  }
}

/**
 * Face login (SEC-04 / FSEC-08): e-mail → random liveness challenge → two
 * photos (looking at the camera, then doing the prompt) → POST
 * /auth/login-with-face. The backend decides; the measures here only time
 * the shots.
 */
export default function FaceLoginClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { faceLoginEnabled, loading: flagsLoading, refresh: refreshFlags } = useFeatureFlags();
  // The server said 403 "Face login is turned off" during this visit (FE-27).
  const [turnedOff, setTurnedOff] = useState(false);
  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [challenge, setChallenge] = useState<FaceChallenge | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [requesting, setRequesting] = useState(false);
  const [locked, setLocked] = useState(false);
  // `/faceLogin?next=/checkout` (passed on from the login page).
  const [next, setNext] = useState("/");

  const capturing = phase === "first" || phase === "second";
  const cameraOn = phase !== "email" && phase !== "done";

  // Shot bookkeeping lives in refs: frames arrive faster than renders.
  const firstShot = useRef<Shot | null>(null);
  const shotTaken = useRef(false);
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  const challengeRef = useRef<FaceChallenge | null>(challenge);
  challengeRef.current = challenge;

  useEffect(() => {
    setNext(safeNextPath(new URLSearchParams(window.location.search).get("next")));
  }, []);

  /** Switched off (403), lock (429), or the generic failure text. Returns true when retrying is pointless. */
  const showFailure = useCallback((err: unknown, fallback: string) => {
    if (isFaceLoginTurnedOff(err)) {
      setTurnedOff(true);
      void refreshFlags();
      return true;
    }
    const minutes = retryAfterMinutes(err);
    if (minutes !== null || (isAxiosError(err) && err.response?.status === 429)) {
      setLocked(true);
      setMessage({
        type: "error",
        text: `Too many failed face sign-in attempts. Try again in ${minutes ?? 15} minute${minutes === 1 ? "" : "s"}, or sign in with your password.`,
      });
      return true;
    }
    setMessage({ type: "error", text: getErrorMessage(err, fallback) });
    return false;
  }, [refreshFlags]);

  const requestChallenge = useCallback(
    async (address: string) => {
      setRequesting(true);
      try {
        const res = await api.post<FaceChallenge>("/auth/face-login/challenge", { email: address });
        setChallenge(res.data);
        setPhase("ready");
        return true;
      } catch (err) {
        showFailure(err, "Could not start face login. Please try again.");
        setPhase("email");
        return false;
      } finally {
        setRequesting(false);
      }
    },
    [showFailure]
  );

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setEmailError("");
    const address = email.trim();
    if (!EMAIL_RE.test(address)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    await requestChallenge(address);
  };

  const send = useCallback(
    async (second: Blob) => {
      const current = challengeRef.current;
      const first = firstShot.current;
      if (!current || !first) return;
      setPhase("sending");
      setMessage({ type: "info", text: "Checking your face…" });
      const formData = new FormData();
      formData.append("email", email.trim());
      formData.append("challengeId", current.challengeId);
      formData.append("neutral", first.blob, "neutral.jpg");
      formData.append("action", second, "action.jpg");
      try {
        const res = await api.post("/auth/login-with-face", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (!res.data?.verified) throw new Error(res.data?.message || "Face login failed.");
        setPhase("done");
        setMessage({ type: "success", text: res.data.message || "Face verified. Logging you in…" });
        // Full navigation so the server-rendered navbar picks up the session.
        setTimeout(() => window.location.assign(afterLoginTarget(next)), 500);
      } catch (err) {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        setChallenge(null);
        if (status === 400 && /expired|already used/i.test(getErrorMessage(err, ""))) {
          // One attempt per challenge, 2 minutes: get a fresh one.
          if (await requestChallenge(email.trim())) {
            setMessage({ type: "info", text: "That check expired. Press “I'm ready” to try again." });
          }
          return;
        }
        // Every failure gets the server's one message (BE-26).
        showFailure(err, FACE_LOGIN_FAILED_MESSAGE);
        setPhase("email");
      }
    },
    [email, next, requestChallenge, showFailure]
  );

  /** Called with every analysed camera frame while the camera is on. */
  const onFrame = useCallback(
    (frame: FaceFrame) => {
      if (shotTaken.current) return;
      const current = phaseRef.current;
      if (current === "first" && frame.metrics && isFrontal(frame.metrics)) {
        shotTaken.current = true;
        const metrics = frame.metrics;
        void canvasToJpeg(frame.canvas).then((blob) => {
          firstShot.current = { blob, metrics };
          shotTaken.current = false;
          setPhase("second");
        });
      } else if (current === "second" && frame.metrics && firstShot.current?.metrics) {
        const action = challengeRef.current?.action;
        if (action && didAction(action, firstShot.current.metrics, frame.metrics)) {
          shotTaken.current = true;
          beep();
          void canvasToJpeg(frame.canvas).then((blob) => {
            shotTaken.current = false;
            void send(blob);
          });
        }
      }
    },
    [send]
  );

  const { status, ready: faceApiReady, cameraError } = useFaceAlignment(videoRef, cameraOn, {
    intervalMs: capturing ? 150 : 500,
    onFrame,
  });

  // Timeouts and the no-face-api fallback for each shot.
  useEffect(() => {
    if (phase === "first") {
      if (!faceApiReady) {
        // No measures available: take the first photo straight away.
        const video = videoRef.current;
        if (!video || video.videoWidth === 0) {
          setPhase("ready");
          setMessage({ type: "error", text: "The camera isn't ready yet. Wait a moment and try again." });
          return;
        }
        captureFrame(video)
          .then((blob) => {
            firstShot.current = { blob, metrics: null };
            setPhase("second");
          })
          .catch(() => {
            setPhase("ready");
            setMessage({ type: "error", text: "Could not take the photo. Please try again." });
          });
        return;
      }
      const t = setTimeout(() => {
        setPhase("ready");
        setMessage({ type: "error", text: "We couldn't see your face clearly. Look straight at the camera, alone, in good light." });
      }, FIRST_SHOT_TIMEOUT);
      return () => clearTimeout(t);
    }
    if (phase === "second") {
      if (!faceApiReady || !firstShot.current?.metrics) {
        const t = setTimeout(() => {
          const video = videoRef.current;
          if (!video) return;
          beep();
          captureFrame(video)
            .then((blob) => void send(blob))
            .catch(() => {
              setPhase("ready");
              setMessage({ type: "error", text: "Could not take the photo. Please try again." });
            });
        }, TIMED_SECOND_SHOT);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setPhase("ready");
        setMessage({ type: "error", text: "We didn't see the movement. Press “I'm ready” and try again." });
      }, SECOND_SHOT_TIMEOUT);
      return () => clearTimeout(t);
    }
  }, [phase, faceApiReady, send]);

  const start = async () => {
    setMessage(null);
    firstShot.current = null;
    shotTaken.current = false;
    // The challenge lasts 2 minutes: renew it if it ran out while waiting.
    if (!challenge || Date.parse(challenge.expiresAt) - Date.now() < 15_000) {
      if (!(await requestChallenge(email.trim()))) return;
    }
    setPhase("first");
  };

  const restart = () => {
    setPhase("email");
    setChallenge(null);
    setMessage(null);
  };

  const backToLogin = next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login";

  if (flagsLoading) {
    return (
      <AuthCard title="Face login">
        <div role="status" aria-label="Loading face login" className="grid gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </AuthCard>
    );
  }

  if (!faceLoginEnabled || turnedOff) {
    return (
      <AuthCard
        title="Face login is unavailable"
        description="Face login has been temporarily disabled by the administrator. Please sign in with your password or continue with Google."
      >
        <Button asChild className="w-full">
          <Link href={backToLogin}>Back to sign in</Link>
        </Button>
      </AuthCard>
    );
  }

  const stepText =
    phase === "first"
      ? "Look straight at the camera…"
      : phase === "second" && challenge
        ? `${ACTION_CUE[challenge.action]}. You'll hear a beep when the photo is taken.`
        : null;

  return (
    <AuthCard
      title="Face login"
      description={phase === "email" ? "Enter your email, then follow one short prompt in front of the camera." : challenge?.prompt}
      footer={
        <Link href={backToLogin} className="text-link hover:underline">
          Use password instead
        </Link>
      }
    >
      {phase === "email" ? (
        <form onSubmit={submitEmail} className="grid gap-4" noValidate>
          {message ? <FormMessage variant={message.type}>{message.text}</FormMessage> : null}
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
          <Button type="submit" className="w-full" loading={requesting} disabled={locked}>
            <ScanFace aria-hidden="true" />
            Continue
          </Button>
          <p className="text-center text-sm text-muted-foreground">{FACE_FIRST_TIME_HINT}</p>
        </form>
      ) : (
        <div className="grid gap-4">
          <div className="mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-full bg-muted ring-4 ring-primary/40">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Live camera preview"
              className="size-full -scale-x-100 object-cover"
            />
          </div>
          <StatusIndicator status={status} />

          <p aria-live="assertive" className="min-h-6 text-center text-base font-semibold">
            {stepText}
          </p>

          {cameraError ? (
            <FormMessage variant="error">
              Cannot access the camera. Allow camera access and reload the page, or sign in with your password.
            </FormMessage>
          ) : null}
          {message ? <FormMessage variant={message.type}>{message.text}</FormMessage> : null}

          {phase === "ready" ? (
            <>
              <p className="text-center text-sm text-muted-foreground">
                Press the button, look at the camera, then do what it says. Both photos are taken for you.
              </p>
              <Button className="w-full" onClick={() => void start()} disabled={cameraError || requesting} loading={requesting}>
                <ScanFace aria-hidden="true" />
                I&apos;m ready
              </Button>
            </>
          ) : null}
          {phase !== "done" ? (
            <Button variant="ghost" className="w-full" onClick={restart} disabled={phase === "sending"}>
              Use a different email
            </Button>
          ) : null}
        </div>
      )}
    </AuthCard>
  );
}
