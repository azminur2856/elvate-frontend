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

/**
 * BE-26: the one answer to every failed face login (also "not set up yet"),
 * used when the server's text is missing.
 */
export const FACE_LOGIN_FAILED_MESSAGE =
  "We couldn't sign you in with your face. If you haven't set up face login yet, sign in with your password and set it up from your profile. Otherwise, make sure your face is clearly visible in good light and follow the on-screen prompt.";

/** FE-26: permanent hint under the face login button. */
export const FACE_FIRST_TIME_HINT = "First time? Sign in with your password and set up face login from your profile.";
