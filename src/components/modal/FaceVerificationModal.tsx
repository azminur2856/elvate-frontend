"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/forms/FormMessage";
import { StatusIndicator, type FaceStatus } from "@/components/shared/StatusIndicator";

const FACE_API_SCRIPT =
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const FACE_API_MODELS = "https://justadudewhohacks.github.io/face-api.js/models";

type Props = {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
};

export default function FaceVerificationModal({ open, onClose, onVerified }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FaceStatus>("none");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  // Start camera + load face-api models while open; stop everything on close.
  useEffect(() => {
    if (!open) return;
    let localStream: MediaStream | undefined;
    let cancelled = false;

    setResult(null);
    setLoading(false);
    setStatus("none");

    async function startCamera() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) {
          localStream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) videoRef.current.srcObject = localStream;
      } catch {
        toast.error("Unable to access the camera.");
      }
    }

    async function loadModels() {
      const faceapi = window.faceapi;
      if (!faceapi) return;
      await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODELS);
      await faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_MODELS);
    }

    async function detectFaceStatus() {
      const faceapi = window.faceapi;
      if (!faceapi || !videoRef.current) return;
      const options = new faceapi.TinyFaceDetectorOptions();
      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks();
      if (cancelled) return;
      if (!detection) {
        setStatus("none");
        return;
      }
      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();
      const dy = rightEye[0].y - leftEye[0].y;
      const dx = rightEye[0].x - leftEye[0].x;
      const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
      setStatus(angle < 10 ? "aligned" : angle < 25 ? "tilted" : "none");
    }

    if (!window.faceapi) {
      const script = document.createElement("script");
      script.src = FACE_API_SCRIPT;
      script.async = true;
      script.onload = () => void loadModels();
      document.body.appendChild(script);
    } else {
      void loadModels();
    }
    void startCamera();
    const interval = setInterval(() => void detectFaceStatus(), 500);

    return () => {
      cancelled = true;
      clearInterval(interval);
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [open]);

  const handleVerify = async () => {
    const video = videoRef.current;
    if (!video) return;
    setLoading(true);
    setResult(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );
      if (!blob) throw new Error("Could not capture the camera frame.");

      const formData = new FormData();
      formData.append("liveImage", blob, "live.jpg");
      const res = await api.post("/users/verify-face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.verified) {
        setResult({ ok: true, text: "Face verified." });
        toast.success("Face verified.");
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
        {result ? (
          <FormMessage variant={result.ok ? "success" : "error"}>
            {result.text}
          </FormMessage>
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
