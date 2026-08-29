"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Camera, Upload } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { resizeImage } from "@/lib/resizeImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const MAX_BYTES = 5 * 1024 * 1024;

export default function ProfileImageUploadModal({ open, onClose, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<"choose" | "camera" | "preview">("choose");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImgFile(null);
    setStep("choose");
  }, [previewUrl, stopCamera]);

  // Always release the camera + object URL when the dialog closes.
  useEffect(() => {
    if (!open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const acceptProcessed = async (source: File | Blob, name: string) => {
    const blob = await resizeImage(
      source instanceof File ? source : new File([source], name, { type: "image/jpeg" }),
      512,
      512,
      0.8
    );
    if (!blob) {
      toast.error("Failed to process the image.");
      return;
    }
    if (blob.size > MAX_BYTES) {
      toast.error("Image is still too large after resizing. Try a smaller one.");
      return;
    }
    setImgFile(new File([blob], name, { type: blob.type || "image/jpeg" }));
    setPreviewUrl(URL.createObjectURL(blob));
    setStep("preview");
  };

  const handleStartCamera = async () => {
    setStep("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      toast.error("Could not access the camera.");
      setStep("choose");
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) void acceptProcessed(blob, "photo.jpg");
    }, "image/jpeg");
    stopCamera();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpe?g|png|gif|webp)$/.test(file.type)) {
      toast.error("Only JPG, PNG, GIF or WebP images are allowed.");
      return;
    }
    await acceptProcessed(file, file.name);
  };

  const handleUpload = async () => {
    if (!imgFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", imgFile);
      await api.patch("/users/updateProfileImage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile photo updated.");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile photo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update profile photo</DialogTitle>
          <DialogDescription>
            Upload an image or take a photo. It will be resized to 512×512.
          </DialogDescription>
        </DialogHeader>

        {step === "choose" ? (
          <div className="grid gap-3">
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload aria-hidden="true" />
              Upload from device
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              aria-label="Choose an image file"
              onChange={handleFileChange}
            />
            <p className="text-center text-sm text-muted-foreground">or</p>
            <Button variant="secondary" onClick={handleStartCamera}>
              <Camera aria-hidden="true" />
              Take a photo
            </Button>
          </div>
        ) : null}

        {step === "camera" ? (
          <div className="grid gap-3">
            <div className="mx-auto aspect-square w-48 overflow-hidden rounded-lg bg-muted">
              <video
                ref={videoRef}
                className="size-full object-cover"
                autoPlay
                playsInline
                muted
                aria-label="Live camera preview"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <Button onClick={handleCapture}>Capture photo</Button>
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
          </div>
        ) : null}

        {step === "preview" && previewUrl ? (
          <div className="grid gap-3">
            <div className="mx-auto size-48 overflow-hidden rounded-full border-2 border-primary shadow-lg">
              {/* Object URL preview — next/image adds nothing for blob: sources */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview of your new profile photo"
                className="size-full object-cover"
              />
            </div>
            <Button onClick={handleUpload} loading={loading}>
              Save photo
            </Button>
            <Button variant="outline" onClick={reset} disabled={loading}>
              Choose another
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
