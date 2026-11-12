"use client";

import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { captureFrame, useFaceAlignment } from "@/hooks/useFaceAlignment";
import type { FaceReferenceResult } from "@/types/face";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/forms/FormMessage";
import { StatusIndicator } from "@/components/shared/StatusIndicator";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called after face login was set up. */
  onVerified?: () => void;
};

/**
 * Face login setup (SEC-04): one camera photo becomes the private reference
 * that face login compares against. It is never the profile picture and is
 * never shown anywhere. `POST /users/face-reference`, multipart `photo`.
 */
export default function FaceVerificationModal({ open, onClose, onVerified }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const takeRef = useRef<HTMLButtonElement>(null);
  const { status, cameraError } = useFaceAlignment(videoRef, open);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setResult(null);
      setLoading(false);
    }
  }, [open]);

  const takePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    setLoading(true);
    setResult(null);
    try {
      const blob = await captureFrame(video);
      const formData = new FormData();
      formData.append("photo", blob, "reference.jpg");
      const res = await api.post<FaceReferenceResult>("/users/face-reference", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.faceLoginEnabled) {
        setResult({ ok: true, text: "Face login is set up. You can now log in with your face." });
        setTimeout(() => {
          onVerified?.();
          onClose();
        }, 1200);
      } else {
        setResult({ ok: false, text: "Face login could not be set up. Please try again." });
      }
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      setResult({
        ok: false,
        text:
          status === 503
            ? "Face login is unavailable right now. Please try again later."
            : getErrorMessage(err, "The photo could not be used. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-sm"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          takeRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Set up face login</DialogTitle>
          <DialogDescription>
            We take one private photo to compare with when you log in with your face. It is never your profile
            picture and is never shown to anyone.
          </DialogDescription>
        </DialogHeader>
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
          <FormMessage variant="error">
            Unable to access the camera. Allow camera access and try again.
          </FormMessage>
        ) : null}
        {result ? (
          <FormMessage variant={result.ok ? "success" : "error"}>{result.text}</FormMessage>
        ) : null}
        <Button
          ref={takeRef}
          className="w-full"
          onClick={takePhoto}
          loading={loading}
          disabled={cameraError || result?.ok === true}
        >
          Take photo
        </Button>
        {status !== "aligned" && !cameraError ? (
          <p className="text-center text-xs text-muted-foreground">
            Tip: the photo works best when the indicator above is green.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
