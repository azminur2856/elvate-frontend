/**
 * Password rule for new passwords (sign-up, reset, change). Matches the
 * backend rule from the security review (SEC-21): at least 8 characters,
 * with letters and numbers. Login never checks it, so older passwords still work.
 */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_HINT = `At least ${PASSWORD_MIN_LENGTH} characters, with letters and numbers.`;

/** `null` when the password meets the rule, otherwise the message to show. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  // ASCII letters and digits, the usual server-side check.
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use both letters and numbers.";
  }
  return null;
}
