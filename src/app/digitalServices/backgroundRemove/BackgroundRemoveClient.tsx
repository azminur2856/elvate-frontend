"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { CloudOff, Download, Eraser, ImageIcon, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { useToolUpload } from "@/hooks/useToolUpload";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { ActionButton } from "@/components/tools/ActionButton";
import { DropZone } from "@/components/tools/DropZone";
import { FileSummary } from "@/components/tools/FileSummary";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { Button } from "@/components/ui/button";

const ACCEPT = ["image/jpeg", "image/png", "image/jpg", "image/heic"];
const MAX_BYTES = 10 * 1024 * 1024;

/** `POST /ocr/image/remove-bg` → `{ contentType: "image/png", data: base64 }`. */
type RemoveBgResponse = { contentType: string; data: string };

/**
 * Background removal. 403 opens the subscription dialog (shared tool hook);
 * 503 (provider not configured) and 404 (endpoint not deployed yet) show a
 * friendly "temporarily unavailable" note instead of an error toast.
 */
export default function BackgroundRemoveClient() {
  const tool = useToolUpload({ accept: ACCEPT, acceptLabel: "JPG, PNG or HEIC" });
  const [result, setResult] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);

  const baseName = tool.file?.name.replace(/\.[^.]+$/, "") || "image";

  const reset = () => {
    setResult(null);
    setUnavailable(null);
    tool.remove();
  };

  const removeBackground = () =>
    tool.run(
      async () => {
        if (!tool.file) return;
        if (tool.file.size > MAX_BYTES) {
          toast.error("Please choose an image of 10 MB or less.");
          return;
        }
        setUnavailable(null);
        const formData = new FormData();
        formData.append("file", tool.file);
        try {
          const res = await api.post<RemoveBgResponse>("/ocr/image/remove-bg", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (res.data?.data) {
            setResult(`data:${res.data.contentType || "image/png"};base64,${res.data.data}`);
            toast.success("Background removed.");
          } else {
            toast.error("The server did not return an image.");
          }
        } catch (err) {
          const status = isAxiosError(err) ? err.response?.status : undefined;
          if (status === 503 || status === 404) {
            setUnavailable(
              status === 503
                ? getErrorMessage(err, "Background removal is temporarily unavailable.")
                : "Background removal is not available yet."
            );
            return;
          }
          throw err; // 403 → subscription dialog, anything else → toast
        }
      },
      {
        subscriptionMessage: "You need an active subscription to remove backgrounds.",
        errorMessage: "Failed to remove the background.",
      }
    );

  return (
    <ToolPageShell
      title="Background Remove"
      description="Upload a photo and get a PNG with a transparent background."
      input={
        tool.file && tool.preview ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.preview}
              alt={`Preview of ${tool.file.name}`}
              className="max-h-72 max-w-full rounded-lg border border-border bg-muted object-contain"
            />
            <FileSummary file={tool.file} onRemove={reset} disabled={tool.busy} />
          </div>
        ) : (
          <DropZone
            inputRef={tool.inputRef}
            accept=".jpg,.jpeg,.png,.heic"
            acceptLabel="JPG, PNG or HEIC, up to 10 MB"
            onFile={tool.select}
            icon={ImageIcon}
            title="Upload an image"
          />
        )
      }
      action={
        <ActionButton
          label="Remove background"
          icon={Eraser}
          onClick={removeBackground}
          loading={tool.busy}
          disabled={!tool.file}
        />
      }
      output={
        <div aria-live="polite" className="flex flex-1 flex-col">
          {result ? (
            <div className="flex flex-1 flex-col items-center gap-3">
              <div className="bg-checkerboard rounded-lg border border-border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result}
                  alt={`${tool.file?.name ?? "Image"} with the background removed`}
                  className="max-h-80 max-w-full object-contain"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <a href={result} download={`${baseName}-no-background.png`}>
                    <Download aria-hidden="true" />
                    Download PNG
                  </a>
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RefreshCw aria-hidden="true" />
                  Try another
                </Button>
              </div>
            </div>
          ) : unavailable ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <CloudOff aria-hidden="true" className="size-6 text-muted-foreground" />
              <p className="font-medium">{unavailable}</p>
              <p className="text-sm text-muted-foreground">Please try again later. Your other tools still work.</p>
            </div>
          ) : (
            <p className="flex flex-1 items-center justify-center text-center text-muted-foreground">
              {tool.busy ? "Removing the background…" : "The cut-out image will appear here."}
            </p>
          )}
        </div>
      }
    >
      <SubscriptionRequiredModal open={tool.sub.open} message={tool.sub.message} onClose={tool.sub.close} />
    </ToolPageShell>
  );
}
