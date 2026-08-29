"use client";

import { Clock, Eraser, ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useToolUpload } from "@/hooks/useToolUpload";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { ActionButton } from "@/components/tools/ActionButton";
import { DropZone } from "@/components/tools/DropZone";
import { FileSummary } from "@/components/tools/FileSummary";
import { ComingSoonBadge, ToolPageShell } from "@/components/tools/ToolPageShell";

const ACCEPT = ["image/jpeg", "image/png", "image/jpg", "image/heic"];

/**
 * The backend endpoint (/ocr/image/remove-bg) is not live yet. The page keeps
 * the upload flow so users can see the tool, and the action says so honestly.
 * When the endpoint ships: call it via `tool.run`, keep the result as a data
 * URL, and render it on a `bg-checkerboard` panel with a download button.
 */
export default function BackgroundRemoveClient() {
  const tool = useToolUpload({ accept: ACCEPT, acceptLabel: "JPG, PNG or HEIC" });

  const removeBackground = () => {
    toast("Background removal is coming soon.", {
      icon: <Clock aria-hidden="true" className="size-4" />,
    });
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
            <FileSummary file={tool.file} onRemove={tool.remove} disabled={tool.busy} />
          </div>
        ) : (
          <DropZone
            inputRef={tool.inputRef}
            accept=".jpg,.jpeg,.png,.heic"
            acceptLabel="JPG, PNG or HEIC"
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
        <div aria-live="polite" className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
          <Clock aria-hidden="true" className="size-6" />
          <p>This tool is coming soon. Your result will appear here once it launches.</p>
        </div>
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
