import { isAxiosError } from "axios";
import { getErrorMessage } from "./errors";

/** Save a Blob as a file via a temporary object URL. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Error message for requests made with `responseType: "blob"`: the error
 * body is then a Blob, so the JSON `{ message }` has to be read first.
 */
export async function getBlobErrorMessage(err: unknown, fallback?: string): Promise<string> {
  if (isAxiosError(err) && err.response?.data instanceof Blob) {
    try {
      const body = JSON.parse(await err.response.data.text()) as { message?: string | string[] };
      if (Array.isArray(body.message) && body.message.length) return body.message.join(", ");
      if (typeof body.message === "string" && body.message) return body.message;
    } catch {
      // not JSON
    }
  }
  return getErrorMessage(err, fallback);
}
