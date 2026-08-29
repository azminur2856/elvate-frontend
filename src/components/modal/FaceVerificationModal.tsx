"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { captureFrame, useFaceAlignment } from "@/hooks/useFaceAlignment";
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
  onVerified?: () => void;
};

export default function FaceVerificationModal({ open, onClose, onVerified }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, cameraError } = useFaceAlignment(videoRef, open);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setResult(null);
      setLoading(false);
    }
  }, [open]);

  const handleVerify = async () => {
    const video = videoRef.current;
    if (!video) return;
    setLoading(true);
    setResult(null);
    try {
      const blob = await captureFrame(video);
      const formData = new FormData();
      formData.append("liveImage", blob, "live.jpg");
      const res = await api.post("/users/verify-face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.verified) {
        setResult({ ok: true, text: "Face verified." });
        setTimeout(() => {
          onVerified?.();
          onClose();
        }, 800);
      } else {
        setResult({ ok: false, text: "Face not matched. Try again." });
      }
    } catch (err) {
      setResult({ ok: false, text: getErrorMessage(err, "Verification failed.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Face verification</DialogTitle>
          <DialogDescription>
            Centre your face in the frame and keep your head straight.
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
              className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
            />
          </div>
          <StatusIndicator status={status} />
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
          className="w-full"
          onClick={handleVerify}
          loading={loading}
          disabled={status !== "aligned"}
        >
          Verify face
        </Button>
      </DialogContent>
    </Dialog>
  );
}
