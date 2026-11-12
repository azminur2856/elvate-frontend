"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { FaceStatus } from "@/components/shared/StatusIndicator";
import { faceMetrics, type FaceMetrics } from "@/lib/face-metrics";

const FACE_API_SCRIPT =
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
/**
 * Subresource Integrity for the exact file above (hash published by jsDelivr
 * for face-api.js@0.22.2). If the CDN ever serves different bytes, the
 * browser refuses to run them and face checks fail closed.
 */
const FACE_API_SCRIPT_INTEGRITY = "sha256-XWbslTONf8w2XOFUgbhZm69LbiLJpiS3bUyoIaZpplk=";
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
      script.integrity = FACE_API_SCRIPT_INTEGRITY;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.async = true;
      script.onload = () => void ready();
      script.onerror = () => resolve(undefined);
      document.head.appendChild(script);
    });
  }
  return loader;
}

/** One analysed camera frame: its own canvas, so it can be sent as is. */
export type FaceFrame = {
  canvas: HTMLCanvasElement;
  /** Null when no face was found in this frame. */
  metrics: FaceMetrics | null;
};

type Options = {
  /** Milliseconds between checks (default 500; face login uses less while capturing). */
  intervalMs?: number;
  /** Called with every analysed frame. */
  onFrame?: (frame: FaceFrame) => void;
};

/**
 * Starts the camera on `videoRef` while `enabled`, checks a frame every
 * `intervalMs` with face-api and reports whether the face is aligned. Each
 * frame is drawn to its own canvas first, so `onFrame` gets exactly the
 * picture that was measured. Stops the camera and the loop on cleanup.
 * Shared by face login and face setup.
 */
export function useFaceAlignment(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  { intervalMs = 500, onFrame }: Options = {}
) {
  const [status, setStatus] = useState<FaceStatus>("none");
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  // Read on every tick, so changing them doesn't restart the camera.
  const intervalRef = useRef(intervalMs);
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    intervalRef.current = intervalMs;
    onFrameRef.current = onFrame;
  });

  useEffect(() => {
    if (!enabled) return;
    const video = videoRef.current; // captured once so cleanup releases the same element
    let cancelled = false;
    let stream: MediaStream | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

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
        if (video) video.srcObject = s;
      })
      .catch(() => !cancelled && setCameraError(true));

    const tick = async (faceapi: FaceApi) => {
      const current = videoRef.current;
      if (current && current.readyState >= 2 && current.videoWidth > 0) {
        const canvas = drawFrame(current);
        try {
          const detection = await faceapi
            .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
          if (cancelled) return;
          if (!detection) {
            setStatus("none");
            onFrameRef.current?.({ canvas, metrics: null });
          } else {
            const left = detection.landmarks.getLeftEye();
            const right = detection.landmarks.getRightEye();
            const angle = Math.abs(
              Math.atan2(right[0].y - left[0].y, right[0].x - left[0].x) * (180 / Math.PI)
            );
            setStatus(angle < 10 ? "aligned" : angle < 25 ? "tilted" : "none");
            onFrameRef.current?.({ canvas, metrics: faceMetrics(detection.landmarks.positions) });
          }
        } catch {
          /* ignore a failed frame */
        }
      }
      if (!cancelled) timer = setTimeout(() => void tick(faceapi), intervalRef.current);
    };

    void loadFaceApi().then((faceapi) => {
      if (cancelled || !faceapi) return;
      setReady(true);
      void tick(faceapi);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      if (video) video.srcObject = null;
    };
  }, [enabled, videoRef]);

  return { status, ready, cameraError };
}

/** Copies the current video frame onto a new canvas. */
export function drawFrame(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** A canvas as a JPEG blob (the face routes accept JPG, PNG or WebP). */
export function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not capture the camera frame."));
    }, "image/jpeg", 0.92);
  });
}

/** Grabs the current video frame as a JPEG blob. */
export function captureFrame(video: HTMLVideoElement): Promise<Blob> {
  return canvasToJpeg(drawFrame(video));
}
