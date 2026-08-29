"use client";

import { useState } from "react";
import { Clock, Download, Eraser, ImageIcon, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { useToolUpload } from "@/hooks/useToolUpload";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { ActionButton } from "@/components/tools/ActionButton";
import { DropZone } from "@/components/tools/DropZone";
import { FileSummary } from "@/components/tools/FileSummary";
import { ComingSoonBadge, ToolPageShell } from "@/components/tools/ToolPageShell";
import { Button } from "@/components/ui/button";

const ACCEPT = ["image/jpeg", "image/png", "image/jpg", "image/heic"];

export default function BackgroundRemoveClient() {
  const tool = useToolUpload({ accept: ACCEPT, acceptLabel: "JPG, PNG or HEIC" });
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // The backend endpoint (/ocr/image/remove-bg) is not live yet. Keep the UI
  // usable and honest: the action explains that the feature is coming soon.
  const removeBackground = () => {
    toast("Background removal is coming soon.", {
      icon: <Clock aria-hidden="true" className="size-4" />,
    });
  };

  const reset = () => {
    setResultUrl(null);
    tool.remove();
  };

  return (
    <ToolPageShell
      title="Background Remove"
      description="Upload a photo and cut its background out."
      badge={<ComingSoonBadge />}
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
            acceptLabel="JPG, PNG or HEIC"
            onFile={(f) => {
              setResultUrl(null);
              tool.select(f);
            }}
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
          disabled={!tool.file || !!resultUrl}
        />
      }
      output={
        resultUrl ? (
          <div className="flex flex-1 flex-col items-center gap-3">
            <div className="bg-checkerboard rounded-lg border border-border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultUrl}
                alt="Image with the background removed"
                className="max-h-72 max-w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <a href={resultUrl} download="no-bg.png">
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
        ) : (
          <p
            className="flex flex-1 items-center justify-center text-center text-muted-foreground"
            aria-live="polite"
          >
            The result will appear here.
          </p>
        )
      }
    >
      <SubscriptionRequiredModal
        open={tool.sub.open}
        message={tool.sub.message}
        onClose={tool.sub.close}
      />
    </ToolPageShell>
  );
}
