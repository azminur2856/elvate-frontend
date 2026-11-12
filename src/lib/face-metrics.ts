/**
 * Simple measurements from the 68 face-api landmarks, used only to time the
 * camera shots for face login (the backend makes the real decision with
 * Face++). Pure functions so they can be unit-tested.
 *
 * Landmark indexes (iBUG 68): left eye 36-41, right eye 42-47, nose tip 30.
 */

export type Point = { x: number; y: number };

export type FaceMetrics = {
  /** Eye aspect ratio, both eyes averaged: about 0.3 open, below about 0.2 closed. */
  eyeOpenness: number;
  /** Nose tip between the outer eye corners: 0.5 = facing the camera, towards 0 or 1 = turned. */
  turn: number;
};

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Eye aspect ratio of one eye from its 6 points (corner, top, top, corner, bottom, bottom). */
export function eyeAspectRatio(eye: Point[]): number {
  if (eye.length < 6) return 0;
  const width = dist(eye[0], eye[3]);
  if (width === 0) return 0;
  return (dist(eye[1], eye[5]) + dist(eye[2], eye[4])) / (2 * width);
}

export function faceMetrics(positions: Point[]): FaceMetrics | null {
  if (positions.length < 68) return null;
  const left = positions.slice(36, 42);
  const right = positions.slice(42, 48);
  const outerLeft = positions[36];
  const outerRight = positions[45];
  const span = outerRight.x - outerLeft.x;
  return {
    eyeOpenness: (eyeAspectRatio(left) + eyeAspectRatio(right)) / 2,
    turn: span === 0 ? 0.5 : (positions[30].x - outerLeft.x) / span,
  };
}

/** Thresholds, a little stricter than the backend so the shot is clearly right. */
export const LIVENESS_HINTS = {
  /** First shot: roughly facing the camera with open eyes. */
  frontalMaxOffset: 0.12,
  openEyesMin: 0.22,
  /** Closed: clearly below the user's own open-eye value (or an absolute floor). */
  closedRatio: 0.7,
  closedAbsolute: 0.19,
  /** Turned: the nose moved this far from the frontal position. */
  turnMinOffset: 0.17,
};

export const isFrontal = (m: FaceMetrics) =>
  Math.abs(m.turn - 0.5) <= LIVENESS_HINTS.frontalMaxOffset && m.eyeOpenness >= LIVENESS_HINTS.openEyesMin;

export function didAction(action: "TURN_HEAD" | "BLINK", neutral: FaceMetrics, now: FaceMetrics): boolean {
  if (action === "TURN_HEAD") return Math.abs(now.turn - neutral.turn) >= LIVENESS_HINTS.turnMinOffset;
  return (
    now.eyeOpenness <= LIVENESS_HINTS.closedAbsolute ||
    now.eyeOpenness <= neutral.eyeOpenness * LIVENESS_HINTS.closedRatio
  );
}
