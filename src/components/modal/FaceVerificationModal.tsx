"use client";

import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import plainApi from "@/lib/api";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { captureFrame, useFaceAlignment } from "@/hooks/useFaceAlignment";
import { useLogout } from "@/hooks/useLogout";
import type { FaceReferenceResult } from "@/types/face";
import { isFaceLoginTurnedOff, useFeatureFlags } from "@/components/settings/FeatureFlagsProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { StatusIndicator } from "@/components/shared/StatusIndicator";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called after face login was set up. */
  onVerified?: () => void;
  /** The account has its own profile picture (not the default one). */
  hasPicture: boolean;
  /** False for Google-only accounts: they skip the password step. */
  hasPassword: boolean;
  /** Opens the profile picture upload. */
  onAddPicture: () => void;
};

type Step = "picture" | "password" | "camera" | "result";

/** The two 401s of the re-authentication step (BE-26), as opposed to an expired session. */
function isReauthFailure(err: unknown): boolean {
  const message = getErrorMessage(err, "");
  return /incorrect password|sign in again/i.test(message);
}

/**
 * Sends without the refresh-and-retry first, so a wrong password is one
 * attempt (setup allows 5 per 15 min), then through the refreshing client
 * only when the session itself had expired.
 */
async function postFaceReference(formData: FormData) {
  const config = { headers: { "Content-Type": "multipart/form-data" } };
  try {
    return await plainApi.post<FaceReferenceResult>("/users/face-reference", formData, config);
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401 && !isReauthFailure(err)) {
      return api.post<FaceReferenceResult>("/users/face-reference", formData, config);
    }
    throw err;
  }
}
type Result = { ok: boolean; text: string; kind: "done" | "mismatch" | "signin" | "off" | "other" };

export const FACE_SETUP_TEXT = {
  needPicture: "Add a profile picture that clearly shows your face before setting up face login.",
  confirmPassword: "For your security, please confirm your password to continue.",
  mismatch:
    "This photo doesn't match your profile picture. Make sure you're the person in your profile picture, or update your profile picture and try again.",
  signInAgain: "For your security, please sign in again before setting up face login.",
  unavailable: "Face login is temporarily unavailable. You'll be able to set it up once it has been re-enabled.",
} as const;

/**
 * Face login setup, "option A" (FE-26 / BE-26): a profile picture that shows
 * the face → confirm the password (skipped for Google-only accounts) → one
 * camera photo, which the server checks against the profile picture and keeps
 * as the private reference → result. `POST /users/face-reference`, multipart
 * `photo` + `password`.
 */
export default function FaceVerificationModal({ open, onClose, onVerified, hasPicture, hasPassword, onAddPicture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const takeRef = useRef<HTMLButtonElement>(null);
  const { refresh: refreshFlags } = useFeatureFlags();
  const { logout, loading: signingOut } = useLogout();

  const firstStep: Step = !hasPicture ? "picture" : hasPassword ? "password" : "camera";
  const [step, setStep] = useState<Step>(firstStep);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const { status, cameraError } = useFaceAlignment(videoRef, open && step === "camera");

  useEffect(() => {
    if (open) {
      setStep(firstStep);
      setPassword("");
      setPasswordError("");
      setResult(null);
      setLoading(false);
    }
    // Only when the dialog opens: the steps move on by themselves after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && step === "camera") takeRef.current?.focus();
  }, [open, step]);

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setPasswordError("Enter your password.");
      return;
    }
    setPasswordError("");
    setStep("camera");
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    setLoading(true);
    try {
      const blob = await captureFrame(video);
      const formData = new FormData();
      formData.append("photo", blob, "reference.jpg");
      if (hasPassword) formData.append("password", password);
      const res = await postFaceReference(formData);
      if (!res.data?.faceLoginEnabled) throw new Error("Face login could not be set up. Please try again.");
      setPassword("");
      setResult({ ok: true, kind: "done", text: "Face login is set up. You can now log in with your face." });
      setStep("result");
      setTimeout(() => {
        onVerified?.();
        onClose();
      }, 1500);
    } catch (err) {
      const code = isAxiosError(err) ? err.response?.status : undefined;
      const message = getErrorMessage(err, "The photo could not be used. Please try again.");
      if (code === 401 && hasPassword && !/sign in again/i.test(message)) {
        setPasswordError(message || "Incorrect password.");
        setStep("password");
      } else if (code === 401) {
        setResult({ ok: false, kind: "signin", text: /sign in again/i.test(message) ? message : FACE_SETUP_TEXT.signInAgain });
        setStep("result");
      } else if (isFaceLoginTurnedOff(err)) {
        void refreshFlags();
        setResult({ ok: false, kind: "off", text: FACE_SETUP_TEXT.unavailable });
        setStep("result");
      } else if (code === 400 && /add a profile picture/i.test(message)) {
        setStep("picture");
      } else {
        setResult({
          ok: false,
          kind: /match your profile picture/i.test(message) ? "mismatch" : "other",
          text: code === 503 ? "Face login is unavailable right now. Please try again later." : message,
        });
        setStep("result");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = hasPassword ? 3 : 2;
  const stepNumber = step === "password" ? 1 : step === "camera" ? (hasPassword ? 2 : 1) : totalSteps;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent
        className="sm:max-w-sm"
        onOpenAutoFocus={(e) => {
          if (step === "camera") {
            e.preventDefault();
            takeRef.current?.focus();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Set up face login</DialogTitle>
          <DialogDescription>
            {step === "picture"
              ? "Face login checks your camera photo against your profile picture once, when you set it up."
              : step === "password"
                ? FACE_SETUP_TEXT.confirmPassword
                : step === "camera"
                  ? "We take one private photo and check it against your profile picture. Face login then compares with this photo; it is never shown to anyone."
                  : "Face login setup"}
          </DialogDescription>
          {step !== "picture" ? (
            <p className="text-xs text-muted-foreground">
              Step {stepNumber} of {totalSteps}
            </p>
          ) : null}
        </DialogHeader>

        {step === "picture" ? (
          <>
            <FormMessage variant="info">{FACE_SETUP_TEXT.needPicture}</FormMessage>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onAddPicture}>Upload a profile picture</Button>
            </DialogFooter>
          </>
        ) : step === "password" ? (
          <form onSubmit={submitPassword} className="grid gap-4" noValidate>
            <FormField id="face-setup-password" label="Password" error={passwordError} required>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Continue</Button>
            </DialogFooter>
          </form>
        ) : step === "camera" ? (
          <>
            <div className="flex flex-col items-center gap-3">
              <div className="relative aspect-square w-56 overflow-hidden rounded-full bg-muted shadow-md">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label="Live camera preview"
                  className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 -scale-x-100 object-cover"
                />
              </div>
              <StatusIndicator status={status} />
              <p className="text-center text-sm text-muted-foreground">
                Look straight at the camera with your eyes open, alone, in good light.
              </p>
            </div>
            {cameraError ? (
              <FormMessage variant="error">Unable to access the camera. Allow camera access and try again.</FormMessage>
            ) : null}
            <Button ref={takeRef} className="w-full" onClick={takePhoto} loading={loading} disabled={cameraError}>
              Take photo
            </Button>
            {status !== "aligned" && !cameraError ? (
              <p className="text-center text-xs text-muted-foreground">
                Tip: the photo works best when the indicator above is green.
              </p>
            ) : null}
            {hasPassword ? (
              <Button variant="ghost" className="w-full" onClick={() => setStep("password")} disabled={loading}>
                Back
              </Button>
            ) : null}
          </>
        ) : result ? (
          <>
            <FormMessage variant={result.ok ? "success" : "error"}>{result.text}</FormMessage>
            {result.ok ? null : (
              <DialogFooter>
                {result.kind === "signin" ? (
                  <Button onClick={() => void logout("/profile")} loading={signingOut}>
                    Sign in again
                  </Button>
                ) : result.kind === "off" ? (
                  <Button onClick={onClose}>Close</Button>
                ) : (
                  <>
                    {result.kind === "mismatch" ? (
                      <Button variant="outline" onClick={onAddPicture}>
                        Update profile picture
                      </Button>
                    ) : null}
                    <Button onClick={() => setStep("camera")}>Try again</Button>
                  </>
                )}
              </DialogFooter>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
