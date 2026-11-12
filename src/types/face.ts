/**
 * Face login (API-CONTRACT.md → "Face login", SEC-04 / FSEC-08).
 */

export type FaceAction = "TURN_HEAD" | "BLINK";

/** `POST /auth/face-login/challenge` → valid 2 minutes, one login attempt. */
export type FaceChallenge = {
  challengeId: string;
  action: FaceAction;
  /** Sentence for the UI, e.g. "Look at the camera, then close your eyes for a moment." */
  prompt: string;
  expiresAt: string;
};

/** `POST /users/face-reference` (face setup) → 201. */
export type FaceReferenceResult = { faceLoginEnabled: boolean };
