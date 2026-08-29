"use client";

import { useEffect, useState, type RefObject } from "react";
import type { FaceStatus } from "@/components/shared/StatusIndicator";

const FACE_API_SCRIPT =
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const FACE_API_MODELS = "https://justadudewhohacks.github.io/face-api.js/models";

let loader: Promise<FaceApi | undefined> | null = null;

/** Loads face-api.js (UMD, from the CDN) and its two models exactly once. */
function loadFaceApi(): Promise<FaceApi | undefined> {
  if (typeof window === "undefined") return Promise.resolve(undefined);
  if (!loader) {
    loader = new Promise((resolve) => {
      const ready = async () => {
        const faceapi = window.faceapi;
        if (!faceapi) return resolve(undefined);
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODELS);
          await faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_MODELS);
          resolve(faceapi);
        } catch {
          resolve(undefined);
        }
      };
      if (window.faceapi) {
        void ready();
        return;
      }
      const script = document.createElement("script");
      script.src = FACE_API_SCRIPT;
      script.async = true;
      script.onload = () => void ready();
      script.onerror = () => resolve(undefined);
      document.head.appendChild(script);
    });
  }
  return loader;
}

/**
 * Starts the camera on `videoRef` while `enabled`, runs face-api every
 * 500 ms and reports whether the face is aligned. Stops the camera and the
 * detection loop on cleanup. Shared by face login and face verification.
 */
export function useFaceAlignment(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean
) {
  const [status, setStatus] = useState<FaceStatus>("none");
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let stream: MediaStream | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;
    let busy = false;

    setStatus("none");
    setCameraError(false);

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => !cancelled && setCameraError(true));

    void loadFaceApi().then((faceapi) => {
      if (cancelled || !faceapi) return;
      setReady(true);
      interval = setInterval(async () => {
        const video = videoRef.current;
        if (busy || !video || video.readyState < 2) return;
        busy = true;
        try {
          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
          if (cancelled) return;
          if (!detection) {
            setStatus("none");
            return;
          }
          const left = detection.landmarks.getLeftEye();
          const right = detection.landmarks.getRightEye();
          const angle = Math.abs(
            Math.atan2(right[0].y - left[0].y, right[0].x - left[0].x) * (180 / Math.PI)
          );
          setStatus(angle < 10 ? "aligned" : angle < 25 ? "tilted" : "none");
        } catch {
          /* ignore a failed frame */
        } finally {
          busy = false;
        }
      }, 500);
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [enabled, videoRef]);

  return { status, ready, cameraError };
}

/** Grabs the current video frame as a JPEG blob. */
export function captureFrame(video: HTMLVideoElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not capture the camera frame."));
    }, "image/jpeg");
  });
}
