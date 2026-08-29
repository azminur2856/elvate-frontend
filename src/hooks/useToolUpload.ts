"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage, isForbidden } from "@/lib/errors";

type Options = {
  /** Accepted MIME types, e.g. ["image/png", "image/jpeg"]. */
  accept: string[];
  /** Human label for the error toast, e.g. "JPG, PNG or HEIC". */
  acceptLabel: string;
};

type RunOptions = {
  subscriptionMessage?: string;
  errorMessage?: string;
};

/**
 * Shared state for the digital-service tool pages: the selected file, an
 * object-URL preview (revoked automatically), a `run()` wrapper that routes
 * 403 to the subscription dialog and other errors to a toast.
 */
export function useToolUpload({ accept, acceptLabel }: Options) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sub, setSub] = useState({ open: false, message: "" });

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const select = useCallback(
    (candidate: File | null | undefined) => {
      if (!candidate) return;
      if (!accept.includes(candidate.type)) {
        toast.error(`Only ${acceptLabel} files are allowed.`);
        return;
      }
      setFile(candidate);
    },
    [accept, acceptLabel]
  );

  const remove = useCallback(() => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, opts: RunOptions = {}): Promise<T | undefined> => {
      setBusy(true);
      try {
        return await fn();
      } catch (err) {
        if (isForbidden(err)) {
          setSub({
            open: true,
            message: getErrorMessage(
              err,
              opts.subscriptionMessage ?? "You need an active subscription to use this feature."
            ),
          });
        } else {
          toast.error(getErrorMessage(err, opts.errorMessage ?? "Something went wrong."));
        }
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  return {
    inputRef,
    file,
    preview,
    select,
    remove,
    busy,
    run,
    sub: {
      open: sub.open,
      message: sub.message,
      close: () => setSub((s) => ({ ...s, open: false })),
    },
  };
}
