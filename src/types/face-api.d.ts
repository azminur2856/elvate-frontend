/**
 * Minimal typing for the face-api.js UMD build that is injected via a
 * <script> tag at runtime (FaceVerificationModal, faceLogin page).
 * Only the members the app actually touches are declared.
 */
interface FaceApiNet {
  loadFromUri(uri: string): Promise<void>;
  params?: unknown;
}

interface FaceApiLandmarks {
  positions: Array<{ x: number; y: number }>;
  getLeftEye(): Array<{ x: number; y: number }>;
  getRightEye(): Array<{ x: number; y: number }>;
  getNose(): Array<{ x: number; y: number }>;
  getJawOutline(): Array<{ x: number; y: number }>;
}

interface FaceApiDetection {
  detection: {
    box: { x: number; y: number; width: number; height: number };
    score: number;
  };
  landmarks: FaceApiLandmarks;
}

interface FaceApiDetectTask {
  withFaceLandmarks(): Promise<FaceApiDetection | undefined>;
}

interface FaceApi {
  nets: {
    tinyFaceDetector: FaceApiNet;
    faceLandmark68Net: FaceApiNet;
  };
  TinyFaceDetectorOptions: new (options?: {
    inputSize?: number;
    scoreThreshold?: number;
  }) => unknown;
  detectSingleFace(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    options?: unknown
  ): FaceApiDetectTask;
}

interface Window {
  faceapi?: FaceApi;
}
