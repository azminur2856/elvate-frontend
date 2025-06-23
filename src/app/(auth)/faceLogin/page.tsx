"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// CDN for face-api.js
const FACE_API_URL =
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const MODELS_URL = "https://justadudewhohacks.github.io/face-api.js/models";

export default function FaceLoginPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [dotColor, setDotColor] = useState("red");
  const [result, setResult] = useState<{ text: string; success?: boolean }>({
    text: "",
  });
  const [spinner, setSpinner] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api.js script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = FACE_API_URL;
    script.async = true;
    script.onload = () => setTimeout(() => setModelsLoaded(true), 300);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Load FaceAPI models after script loads
  useEffect(() => {
    if (modelsLoaded && (window as any).faceapi) {
      (async () => {
        await (window as any).faceapi.nets.tinyFaceDetector.loadFromUri(
          MODELS_URL
        );
        await (window as any).faceapi.nets.faceLandmark68Net.loadFromUri(
          MODELS_URL
        );
      })();
    }
  }, [modelsLoaded]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setResult({ text: "Cannot access webcam." }));

    return () => {
      stopVideoStream(videoRef.current); // Clean up on unmount
    };
  }, []);

  // Live face status (dot color)
  useEffect(() => {
    let interval: any;
    const detect = async () => {
      if (
        !(window as any).faceapi ||
        !(window as any).faceapi.nets.tinyFaceDetector.params ||
        !videoRef.current
      )
        return;
      const faceapi = (window as any).faceapi;
      const options = new faceapi.TinyFaceDetectorOptions();
      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks();
      if (!detection) {
        setDotColor("red");
        return;
      }
      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();
      const dy = rightEye[0].y - leftEye[0].y;
      const dx = rightEye[0].x - leftEye[0].x;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (Math.abs(angle) < 10) setDotColor("green");
      else if (Math.abs(angle) < 25) setDotColor("yellow");
      else setDotColor("red");
    };
    interval = setInterval(detect, 500);
    return () => clearInterval(interval);
  }, [modelsLoaded]);

  // Show error for a short period
  const showEmailError = (msg: string) => {
    setEmailError(msg);
    setTimeout(() => setEmailError(""), 3000);
  };

  // Face login
  const handleLogin = async () => {
    setResult({ text: "" });
    if (!email) {
      showEmailError("Email is required");
      return;
    }
    if (!videoRef.current) return;

    setSpinner(true);
    // Take snapshot
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);

    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg")
    );

    const formData = new FormData();
    formData.append("email", email);
    formData.append("liveImage", blob, "live.jpg");

    try {
      const res = await api.post("/auth/login-with-face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSpinner(false);

      const data = res.data;

      if (!res.status || !data.verified) {
        setResult({ text: data.message || "Login failed." });
        return;
      }

      setResult({ text: data.message, success: true });
      setTimeout(() => {
        stopVideoStream(videoRef.current);
        router.push("/profile");
      }, 500);
    } catch (err: any) {
      setSpinner(false);
      setResult({
        text: "Error: " + (err.response?.data?.message || err.message),
      });
    }
  };

  function stopVideoStream(videoElement: HTMLVideoElement | null) {
    if (videoElement && videoElement.srcObject) {
      const tracks = (videoElement.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }

  return (
    <div className="bg-neutral-900/95 border border-neutral-800 p-8 rounded-2xl shadow-2xl text-center w-full max-w-md relative top-20">
      <h2 className="mb-5 text-3xl font-bold text-white">Face Login</h2>
      <input
        className="w-full p-2 mb-1 text-base bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
        value={email}
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="text-sm text-red-400 mb-3 h-4">{emailError}</div>
      <div className="relative mx-auto mb-4 rounded-full overflow-hidden w-80 h-80 bg-black shadow-[0_0_0_5px_rgba(59,130,246,0.5)]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
        />
      </div>
      <div
        className={`w-3 h-3 rounded-full mx-auto mb-4 transition-colors`}
        style={{
          backgroundColor: dotColor,
          boxShadow: `0 0 10px ${dotColor}`,
        }}
      ></div>
      <button
        className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold mt-2 transition duration-150`}
        onClick={handleLogin}
        disabled={spinner}
      >
        {spinner ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Login With Face"
        )}
      </button>
      <p
        id="result"
        className={`mt-4 font-bold ${
          result.text
            ? result.success
              ? "text-green-400"
              : "text-red-400"
            : ""
        }`}
      >
        {result.text}
      </p>
      {/* FaceAPI script */}
      <script src={FACE_API_URL} defer />
    </div>
  );
}
