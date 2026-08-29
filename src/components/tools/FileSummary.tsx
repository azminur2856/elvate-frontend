"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type FileSummaryProps = {
  file: File;
  extra?: React.ReactNode;
  onRemove: () => void;
  removeLabel?: string;
  disabled?: boolean;
};

/** File name + size + remove button shown under a preview. */
export function FileSummary({
  file,
  extra,
  onRemove,
  removeLabel = "Remove file",
  disabled,
}: FileSummaryProps) {
  return (
    <div className="mt-3 flex w-full flex-col items-center gap-1 text-center">
      <p className="max-w-full truncate font-medium" title={file.name}>
        {file.name}
      </p>
      <p className="text-sm text-muted-foreground">
        {formatBytes(file.size)}
        {extra ? <> · {extra}</> : null}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={onRemove}
        disabled={disabled}
      >
        <Trash2 aria-hidden="true" />
        {removeLabel}
      </Button>
    </div>
  );
}
