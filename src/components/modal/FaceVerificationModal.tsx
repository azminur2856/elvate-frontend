"use client";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "@/lib/authAxios";

export default function FaceVerificationModal({
  open,
  onClose,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [statusColor, setStatusColor] = useState("red");
  const [resultMsg, setResultMsg] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Start camera and load face-api models
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let localStream: MediaStream;

    async function startCamera() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = localStream;
        setStream(localStream);
      } catch {
        toast.error("Unable to access camera");
      }
    }
    async function loadModels() {
      // @ts-ignore
      if (!window.faceapi) return;
      // @ts-ignore
      await window.faceapi.nets.tinyFaceDetector.loadFromUri(
        "https://justadudewhohacks.github.io/face-api.js/models"
      );
      // @ts-ignore
      await window.faceapi.nets.faceLandmark68Net.loadFromUri(
        "https://justadudewhohacks.github.io/face-api.js/models"
      );
    }
    async function detectFaceStatus() {
      // @ts-ignore
      if (!window.faceapi || !videoRef.current) return;
      // @ts-ignore
      const options = new window.faceapi.TinyFaceDetectorOptions();
      // @ts-ignore
      const detection = await window.faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks();
      if (!detection) setStatusColor("red");
      else {
        const leftEye = detection.landmarks.getLeftEye();
        const rightEye = detection.landmarks.getRightEye();
        const dy = rightEye[0].y - leftEye[0].y;
        const dx = rightEye[0].x - leftEye[0].x;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (Math.abs(angle) < 10) setStatusColor("green");
        else if (Math.abs(angle) < 25) setStatusColor("yellow");
        else setStatusColor("red");
      }
    }

    if (open) {
      setResultMsg("");
      setLoading(false);
      // Load face-api.js from CDN if not present
      if (!("faceapi" in window)) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
        script.async = true;
        script.onload = async () => {
          await loadModels();
        };
        document.body.appendChild(script);
      } else {
        loadModels();
      }
      startCamera();
      interval = setInterval(detectFaceStatus, 500);
    }

    return () => {
      clearInterval(interval);
      if (localStream) localStream.getTracks().forEach((track) => track.stop());
      setStream(null);
    };
    // eslint-disable-next-line
  }, [open]);

  if (!open) return null;

  const handleVerify = async () => {
    setLoading(true);
    setResultMsg("");
    try {
      // Snapshot
      const video = videoRef.current;
      if (!video) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg")
      );
      const formData = new FormData();
      formData.append("liveImage", blob, "live.jpg");
      // Call backend API (uses authAxios with JWT cookies)
      const res = await api.post("/users/verify-face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.verified) {
        setResultMsg("✅ Face verified!");
        toast.success("Face verified!");
        onVerified && setTimeout(onVerified, 800);
        setTimeout(onClose, 800);
      } else {
        setResultMsg("❌ Face not matched.");
        toast.error("Face not matched");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Verification failed";
      setResultMsg(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-100"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-center text-white">
          Face Verification
        </h3>
        <div className="flex flex-col items-center mb-4">
          <div className="relative rounded-full overflow-hidden w-56 h-56 bg-black shadow-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
            />
          </div>
          <div
            className="w-3 h-3 rounded-full mt-4 mb-2 transition-colors"
            style={{
              backgroundColor: statusColor,
              boxShadow: `0 0 10px ${statusColor}`,
            }}
          ></div>
        </div>
        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-gray-600"
          disabled={loading}
        >
          {loading ? "Processing..." : "Verify Face"}
        </button>
        <p className="mt-3 text-center text-base font-bold text-white">
          {resultMsg}
        </p>
      </div>
    </div>
  );
}
