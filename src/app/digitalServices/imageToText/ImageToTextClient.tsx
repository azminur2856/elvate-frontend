"use client";

import { useState } from "react";
import { ImageIcon, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { useToolUpload } from "@/hooks/useToolUpload";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { ActionButton } from "@/components/tools/ActionButton";
import { DropZone } from "@/components/tools/DropZone";
import { FileSummary } from "@/components/tools/FileSummary";
import { TextResultPanel } from "@/components/tools/ResultPanel";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const ACCEPT = ["image/jpeg", "image/jpg", "image/png", "image/heic"];

export default function ImageToTextClient() {
  const tool = useToolUpload({ accept: ACCEPT, acceptLabel: "JPG, PNG or HEIC" });
  const [text, setText] = useState<string | null>(null);

  const selectFile = (f: File | null | undefined) => {
    setText(null);
    tool.select(f);
  };

  const extract = () =>
    tool.run(
      async () => {
        if (!tool.file) return;
        const formData = new FormData();
        formData.append("file", tool.file);
        const res = await api.post("/ocr/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setText(res.data?.text ?? "");
        toast.success("Text extracted.");
      },
      {
        subscriptionMessage: "You need an active subscription to use OCR.",
        errorMessage: "Failed to extract text.",
      }
    );

  return (
    <ToolPageShell
      title="Image to Text"
      description="Upload a photo or scan and extract its text with OCR."
      input={
        tool.file && tool.preview ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            {/* Object URL preview — next/image adds nothing for blob: sources */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.preview}
              alt={`Preview of ${tool.file.name}`}
              className="max-h-80 max-w-full rounded-lg border border-border bg-muted object-contain"
            />
            <FileSummary
              file={tool.file}
              onRemove={() => {
                setText(null);
                tool.remove();
              }}
              disabled={tool.busy}
            />
          </div>
        ) : (
          <DropZone
            inputRef={tool.inputRef}
            accept=".jpg,.jpeg,.png,.heic"
            acceptLabel="JPG, PNG or HEIC"
            onFile={selectFile}
            icon={ImageIcon}
            title="Upload an image"
          />
        )
      }
      action={
        <ActionButton
          label="Extract text"
          icon={Sparkles}
          onClick={() => void extract()}
          loading={tool.busy}
          disabled={!tool.file || text !== null}
        />
      }
      output={
        <TextResultPanel
          text={text}
          busy={tool.busy}
          label="Extracted text"
          emptyText="Upload an image and press Extract text to see the result here."
        />
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
