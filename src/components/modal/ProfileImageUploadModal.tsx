"use client";
import api from "@/lib/authAxios";
import { resizeImage } from "@/lib/resizeImage";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ProfileImageUploadModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<"choose" | "camera" | "preview">("choose");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Start camera
  const handleStartCamera = async () => {
    setStep("camera");
    setPreviewUrl(null);
    setImgFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      toast.error("Could not access camera");
      setStep("choose");
    }
  };

  // Capture photo from video
  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        ?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the raw captured image as a Blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Resize/compress the captured image
          const tempFile = new File([blob], "photo.jpg", {
            type: "image/jpeg",
          });
          const resizedBlob = await resizeImage(tempFile, 512, 512, 0.8);

          if (!resizedBlob) {
            toast.error("Failed to process captured image.");
            return;
          }
          if (resizedBlob.size > 5 * 1024 * 1024) {
            toast.error("Image is too large after resizing. Try again.");
            return;
          }

          const file = new File([resizedBlob], "photo.jpg", {
            type: "image/jpeg",
          });
          setImgFile(file);
          setPreviewUrl(URL.createObjectURL(resizedBlob));
          setStep("preview");
        }
      }, "image/jpeg");
    }
    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Handle file select/upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
      toast.error("Only image files allowed.");
      return;
    }
    // Resize/compress here
    const blob = await resizeImage(file, 512, 512, 0.8);
    if (!blob) {
      toast.error("Failed to process image.");
      return;
    }
    if (blob.size > 5 * 1024 * 1024) {
      toast.error("Image too large after resize. Try a smaller image.");
      return;
    }
    const newFile = new File([blob], file.name, { type: blob.type });
    setImgFile(newFile);
    setPreviewUrl(URL.createObjectURL(blob));
    setStep("preview");
  };

  // Upload profile image
  const handleUpload = async () => {
    if (!imgFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", imgFile);
      await api.patch("/users/updateProfileImage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile image updated!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Failed to update profile image"
      );
    } finally {
      setLoading(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  };

  // Reset on close
  const handleClose = () => {
    setPreviewUrl(null);
    setImgFile(null);
    setStep("choose");
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-2xl max-w-sm w-full relative border border-neutral-800">
        <button
          className="absolute right-3 top-2 text-2xl text-gray-400 hover:text-white"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">
          Update Profile Picture
        </h3>

        {step === "choose" && (
          <div className="flex flex-col items-center gap-4">
            <button
              className="w-full bg-blue-600 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload from device
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="text-gray-400">or</span>
            <button
              className="w-full bg-green-600 py-2 rounded-md font-semibold hover:bg-green-700 transition"
              onClick={handleStartCamera}
            >
              Take a photo
            </button>
          </div>
        )}

        {step === "camera" && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48 bg-black rounded-lg overflow-hidden mb-2">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <button
              className="w-full bg-blue-600 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              onClick={handleCapture}
            >
              Capture Photo
            </button>
            <button
              className="w-full bg-gray-700 py-2 rounded-md font-semibold hover:bg-gray-800 transition"
              onClick={() => {
                // Stop camera
                if (videoRef.current && videoRef.current.srcObject) {
                  (videoRef.current.srcObject as MediaStream)
                    .getTracks()
                    .forEach((track) => track.stop());
                  videoRef.current.srcObject = null;
                }
                setStep("choose");
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {step === "preview" && previewUrl && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-blue-700 shadow-lg mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              className="w-full bg-blue-600 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Save"}
            </button>
            <button
              className="w-full bg-gray-700 py-2 rounded-md font-semibold hover:bg-gray-800 transition"
              onClick={() => {
                setStep("choose");
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setImgFile(null);
              }}
            >
              Choose another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
