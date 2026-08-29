"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

type TextResultPanelProps = {
  text: string | null;
  busy: boolean;
  busyLabel?: string;
  emptyText?: string;
  label: string;
};

/** Read-only text result with an accessible Copy button. */
export function TextResultPanel({
  text,
  busy,
  busyLabel = "Extracting text…",
  emptyText = "The extracted text will appear here.",
  label,
}: TextResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      toast.success("Copied to clipboard.");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Could not copy. Select the text and copy manually.");
    }
  };

  // One persistent live region so state changes (busy → result) are announced.
  return (
    <div aria-live="polite" className="flex flex-1 flex-col">
      {busy ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <Spinner size="lg" label={busyLabel} />
          <p aria-hidden="true">{busyLabel}</p>
        </div>
      ) : !text ? (
        <p className="flex flex-1 items-center justify-center text-center text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{label}</p>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea
            readOnly
            value={text}
            aria-label={label}
            className="min-h-72 flex-1 resize-none font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}
