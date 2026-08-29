"use client";

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { useToolUpload } from "@/hooks/useToolUpload";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { ActionButton } from "@/components/tools/ActionButton";
import { DropZone } from "@/components/tools/DropZone";
import { FileSummary } from "@/components/tools/FileSummary";
import { TextResultPanel } from "@/components/tools/ResultPanel";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const ACCEPT = ["application/pdf"];

export default function PdfToTextClient() {
  const tool = useToolUpload({ accept: ACCEPT, acceptLabel: "PDF" });
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
        const res = await api.post("/ocr/upload/pdf", formData, {
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
      title="PDF to Text"
      description="Upload a PDF and extract its text with OCR."
      input={
        tool.file && tool.preview ? (
          <div className="flex flex-1 flex-col items-center">
            <iframe
              src={tool.preview}
              title={`Preview of ${tool.file.name}`}
              className="h-80 w-full flex-1 rounded-lg border border-border bg-muted"
            />
            <a
              href={tool.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-link hover:underline"
            >
              Open the PDF in a new tab
            </a>
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
            accept=".pdf"
            acceptLabel="PDF"
            onFile={selectFile}
            icon={FileText}
            title="Upload a PDF"
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
          emptyText="Upload a PDF and press Extract text to see the result here."
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
