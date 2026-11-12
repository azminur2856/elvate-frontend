/**
 * Password rule for new passwords (sign-up, reset, change). Matches the
 * backend rule from the security review (SEC-21): 8 to 72 characters,
 * with letters and numbers. Login never checks it, so older passwords still work.
 */
export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt ignores everything after 72 bytes, so the backend refuses longer ones. */
export const PASSWORD_MAX_LENGTH = 72;

export const PASSWORD_HINT = `${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters, with letters and numbers.`;

/** `null` when the password meets the rule, otherwise the message to show. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  // ASCII letters and digits, the usual server-side check.
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use both letters and numbers.";
  }
  return null;
}
