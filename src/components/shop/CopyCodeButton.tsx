"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / insecure context: fall back to a hidden textarea.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Copies a coupon code; the label flips to "Copied" for a moment. */
export function CopyCodeButton({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={async () => {
        if (await copyText(code)) {
          setCopied(true);
          toast.success(`Copied ${code}. Paste it at checkout.`);
          window.setTimeout(() => setCopied(false), 2000);
        } else {
          toast.error("Couldn't copy. Please select the code and copy it manually.");
        }
      }}
      aria-label={copied ? `Copied ${code}` : `Copy code ${code}`}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}
