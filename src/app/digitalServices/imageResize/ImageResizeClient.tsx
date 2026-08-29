"use client";

import { useEffect, useState } from "react";
import { Download, ImageIcon, RefreshCw, Scaling } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { useToolUpload } from "@/hooks/useToolUpload";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { ActionButton } from "@/components/tools/ActionButton";
import { DropZone } from "@/components/tools/DropZone";
import { FileSummary } from "@/components/tools/FileSummary";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACCEPT = ["image/jpeg", "image/png", "image/jpg", "image/heic"];

const PRESETS = [
  { label: "Passport photo (300×400 px)", width: 300, height: 400 },
  { label: "3R print (1050×1500 px, 300 dpi)", width: 1050, height: 1500 },
  { label: "4R print (1200×1800 px, 300 dpi)", width: 1200, height: 1800 },
  { label: "Square (500×500 px)", width: 500, height: 500 },
];

export default function ImageResizeClient() {
  const tool = useToolUpload({ accept: ACCEPT, acceptLabel: "JPG, PNG or HEIC" });
  const [orig, setOrig] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [preset, setPreset] = useState<string>("");
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);

  // Read the natural size once a file is selected.
  useEffect(() => {
    if (!tool.preview) {
      setOrig(null);
      setWidth("");
      setHeight("");
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      setOrig({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    };
    img.src = tool.preview;
  }, [tool.preview]);

  const aspect = orig ? orig.w / orig.h : null;

  const onWidth = (v: string) => {
    setWidth(v);
    setPreset("");
    const w = parseInt(v, 10);
    if (keepAspect && aspect && w) setHeight(String(Math.round(w / aspect)));
  };
  const onHeight = (v: string) => {
    setHeight(v);
    setPreset("");
    const h = parseInt(v, 10);
    if (keepAspect && aspect && h) setWidth(String(Math.round(h * aspect)));
  };
  const applyPreset = (label: string) => {
    const p = PRESETS.find((x) => x.label === label);
    if (!p) return;
    setPreset(label);
    setWidth(String(p.width));
    setHeight(String(p.height));
    setKeepAspect(false);
  };

  const reset = () => {
    setResizedUrl(null);
    setPreset("");
    setKeepAspect(true);
    tool.remove();
  };

  const unchanged =
    !!orig && parseInt(width, 10) === orig.w && parseInt(height, 10) === orig.h;

  const resize = () =>
    tool.run(
      async () => {
        if (!tool.file) return;
        if (!width || !height) {
          toast.error("Enter a width and a height.");
          return;
        }
        const formData = new FormData();
        formData.append("file", tool.file);
        formData.append("width", width);
        formData.append("height", height);
        const res = await api.post("/ocr/image/resize", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.data) {
          setResizedUrl(`data:${res.data.contentType};base64,${res.data.data}`);
          toast.success("Image resized.");
        } else {
          toast.error("The server did not return an image.");
        }
      },
      {
        subscriptionMessage: "You need an active subscription to resize images.",
        errorMessage: "Failed to resize the image.",
      }
    );

  return (
    <ToolPageShell
      title="Image Resize"
      description="Pick a preset or enter exact pixel dimensions."
      input={
        tool.file && tool.preview ? (
          <div className="flex flex-1 flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.preview}
              alt={`Preview of ${tool.file.name}`}
              className="max-h-56 max-w-full rounded-lg border border-border bg-muted object-contain"
            />
            <FileSummary
              file={tool.file}
              extra={orig ? `${orig.w} × ${orig.h} px` : undefined}
              onRemove={reset}
              disabled={tool.busy}
            />

            <div className="mt-4 grid w-full max-w-sm gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="preset">Preset size</Label>
                <Select value={preset} onValueChange={applyPreset}>
                  <SelectTrigger id="preset" className="w-full">
                    <SelectValue placeholder="Choose a preset (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((p) => (
                      <SelectItem key={p.label} value={p.label}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    inputMode="numeric"
                    min={16}
                    max={4096}
                    value={width}
                    onChange={(e) => onWidth(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    inputMode="numeric"
                    min={16}
                    max={4096}
                    value={height}
                    onChange={(e) => onHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="lock-ratio"
                  checked={keepAspect}
                  onCheckedChange={(v) => setKeepAspect(v === true)}
                />
                <Label htmlFor="lock-ratio" className="font-normal">
                  Keep aspect ratio
                </Label>
              </div>
            </div>
          </div>
        ) : (
          <DropZone
            inputRef={tool.inputRef}
            accept=".jpg,.jpeg,.png,.heic"
            acceptLabel="JPG, PNG or HEIC"
            onFile={(f) => {
              setResizedUrl(null);
              tool.select(f);
            }}
            icon={ImageIcon}
            title="Upload an image"
          />
        )
      }
      action={
        <ActionButton
          label="Resize image"
          icon={Scaling}
          onClick={() => void resize()}
          loading={tool.busy}
          disabled={!tool.file || !width || !height || unchanged}
        />
      }
      output={
        resizedUrl ? (
          <div className="flex flex-1 flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resizedUrl}
              alt={`Resized to ${width} by ${height} pixels`}
              className="max-h-80 max-w-full rounded-lg border border-border bg-muted object-contain"
            />
            <p className="text-sm text-muted-foreground">
              {width} × {height} px
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <a href={resizedUrl} download="resized.jpg">
                  <Download aria-hidden="true" />
                  Download
                </a>
              </Button>
              <Button variant="outline" onClick={reset}>
                <RefreshCw aria-hidden="true" />
                Resize another
              </Button>
            </div>
          </div>
        ) : (
          <p
            className="flex flex-1 items-center justify-center text-center text-muted-foreground"
            aria-live="polite"
          >
            {tool.busy ? "Resizing…" : "The resized image will appear here."}
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
