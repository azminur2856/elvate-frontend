"use client";

import { useId, useState, type RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DropZoneProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  /** `accept` attribute for the file input, e.g. ".jpg,.png". */
  accept: string;
  acceptLabel: string;
  onFile: (file: File | null | undefined) => void;
  icon: LucideIcon;
  title: string;
  className?: string;
};

/**
 * Keyboard-operable drop zone: a real <button> opens the picker
 * (Enter/Space), drag-and-drop is a progressive enhancement.
 */
export function DropZone({
  inputRef,
  accept,
  acceptLabel,
  onFile,
  icon: Icon,
  title,
  className,
}: DropZoneProps) {
  const hintId = useId();
  const [dragging, setDragging] = useState(false);

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        aria-label={`Choose a file (${acceptLabel})`}
        tabIndex={-1}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <button
        type="button"
        aria-describedby={hintId}
        data-dragging={dragging || undefined}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFile(e.dataTransfer.files?.[0]);
        }}
        className="flex min-h-64 flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-center transition-colors hover:border-primary/60 hover:bg-muted/70 focus-visible:border-primary data-[dragging]:border-primary data-[dragging]:bg-primary/10"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-background text-primary shadow-sm">
          <Icon aria-hidden="true" className="size-7" />
        </span>
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">
          Drag &amp; drop here, or{" "}
          <span className="text-link underline">browse your files</span>
        </span>
        <span id={hintId} className="text-sm text-muted-foreground">
          Accepted: {acceptLabel}
        </span>
      </button>
    </div>
  );
}
