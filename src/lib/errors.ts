import { isAxiosError } from "axios";

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

/**
 * Turn any thrown value (Axios error, Error, string, unknown) into a
 * user-facing message. Replaces the `catch (err: any)` pattern.
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as ApiErrorBody | undefined;
    const message = data?.message;
    if (Array.isArray(message) && message.length) return message.join(", ");
    if (typeof message === "string" && message) return message;
    if (typeof data?.error === "string" && data.error) return data.error;
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}

/** True when the backend answered 403 (used to open the subscription dialog). */
export function isForbidden(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 403;
}
