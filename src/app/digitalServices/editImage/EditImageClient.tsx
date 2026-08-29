"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ImageIcon, RotateCcw, Save, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { useToolUpload } from "@/hooks/useToolUpload";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { DropZone } from "@/components/tools/DropZone";
import { FileSummary } from "@/components/tools/FileSummary";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type EditOptions = {
  crop?: { left: number; top: number; width: number; height: number };
  resize?: { width?: number; height?: number };
  rotate?: number;
  brightness?: number;
  contrast?: number;
  grayscale?: boolean;
  flip?: boolean;
  flop?: boolean;
  blur?: number;
};

const ACCEPT = ["image/png", "image/jpeg", "image/jpg", "image/heic"];

const DEFAULT_EDIT: EditOptions = {
  brightness: 1,
  contrast: 1,
  grayscale: false,
  flip: false,
  flop: false,
  blur: 0,
  rotate: 0,
};

function RangeControl({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {format(value)}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
        aria-valuetext={format(value)}
      />
    </div>
  );
}

export default function EditImageClient() {
  const tool = useToolUpload({ accept: ACCEPT, acceptLabel: "JPG, PNG or HEIC" });
  const [opts, setOpts] = useState<EditOptions>({ ...DEFAULT_EDIT });
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const setOpt = <K extends keyof EditOptions>(key: K, value: EditOptions[K]) =>
    setOpts((o) => ({ ...o, [key]: value }));

  const resetEdits = () => {
    setOpts({ ...DEFAULT_EDIT });
    setEditedUrl(null);
    setCropMode(false);
    setCroppedArea(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const removeFile = () => {
    resetEdits();
    tool.remove();
  };

  const apply = () =>
    tool.run(
      async () => {
        if (!tool.file) return;
        const finalOpts: EditOptions = { ...opts };
        if (cropMode && croppedArea) {
          finalOpts.crop = {
            left: Math.round(croppedArea.x),
            top: Math.round(croppedArea.y),
            width: Math.round(croppedArea.width),
            height: Math.round(croppedArea.height),
          };
        } else {
          finalOpts.crop = undefined;
        }
        const formData = new FormData();
        formData.append("file", tool.file);
        formData.append("options", JSON.stringify(finalOpts));
        const res = await api.post("/ocr/image/edit", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEditedUrl(`data:${res.data.contentType};base64,${res.data.data}`);
        toast.success("Preview updated.");
        if (cropMode) setCropMode(false);
      },
      {
        subscriptionMessage: "You need an active subscription to edit images.",
        errorMessage: "Failed to edit the image.",
      }
    );

  const download = () => {
    if (!editedUrl) return;
    const link = document.createElement("a");
    link.href = editedUrl;
    link.download = "edited-image.png";
    link.click();
  };

  const source = editedUrl || tool.preview || "";

  return (
    <ToolPageShell
      title="Edit Image"
      description="Crop, resize, rotate and adjust brightness, contrast and blur."
      input={
        tool.file && tool.preview ? (
          <div className="flex flex-1 flex-col items-center">
            {cropMode ? (
              <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg border border-border bg-muted">
                <Cropper
                  image={source}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, area) => setCroppedArea(area)}
                  cropShape="rect"
                  showGrid
                />
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={source}
                alt={editedUrl ? "Edited preview" : `Preview of ${tool.file.name}`}
                className="max-h-96 w-full max-w-sm rounded-lg border border-border bg-muted object-contain"
              />
            )}
            {cropMode ? (
              <div className="mt-3 w-full max-w-sm">
                <RangeControl
                  id="zoom"
                  label="Zoom"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.01}
                  format={(v) => `${v.toFixed(2)}×`}
                  onChange={setZoom}
                />
              </div>
            ) : null}
            <FileSummary file={tool.file} onRemove={removeFile} disabled={tool.busy} />
          </div>
        ) : (
          <DropZone
            inputRef={tool.inputRef}
            accept=".jpg,.jpeg,.png,.heic"
            acceptLabel="JPG, PNG or HEIC"
            onFile={(f) => {
              resetEdits();
              tool.select(f);
            }}
            icon={ImageIcon}
            title="Upload an image to edit"
          />
        )
      }
      output={
        tool.file ? (
          <div className="grid gap-5">
            <h2 className="text-lg font-semibold">Adjustments</h2>

            <div className="flex items-center gap-2">
              <Checkbox
                id="crop-mode"
                checked={cropMode}
                onCheckedChange={(v) => {
                  const on = v === true;
                  setCropMode(on);
                  if (!on) {
                    setCroppedArea(null);
                    setOpt("crop", undefined);
                  }
                }}
              />
              <Label htmlFor="crop-mode" className="font-normal">
                Crop (drag the image to choose the area)
              </Label>
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Resize (px)</legend>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="resize-w" className="text-muted-foreground">
                    Width
                  </Label>
                  <Input
                    id="resize-w"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={opts.resize?.width ?? ""}
                    onChange={(e) =>
                      setOpt("resize", {
                        ...opts.resize,
                        width: Number(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="resize-h" className="text-muted-foreground">
                    Height
                  </Label>
                  <Input
                    id="resize-h"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={opts.resize?.height ?? ""}
                    onChange={(e) =>
                      setOpt("resize", {
                        ...opts.resize,
                        height: Number(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>
            </fieldset>

            <div className="grid gap-1.5">
              <Label htmlFor="rotate">Rotate (degrees)</Label>
              <Input
                id="rotate"
                type="number"
                inputMode="numeric"
                min={-360}
                max={360}
                className="w-32"
                value={opts.rotate ?? 0}
                onChange={(e) => setOpt("rotate", Number(e.target.value))}
              />
            </div>

            <RangeControl
              id="brightness"
              label="Brightness"
              value={opts.brightness ?? 1}
              min={0}
              max={2}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={(v) => setOpt("brightness", v)}
            />
            <RangeControl
              id="contrast"
              label="Contrast"
              value={opts.contrast ?? 1}
              min={0}
              max={2}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={(v) => setOpt("contrast", v)}
            />
            <RangeControl
              id="blur"
              label="Blur"
              value={opts.blur ?? 0}
              min={0}
              max={10}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={(v) => setOpt("blur", v)}
            />

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {(
                [
                  ["grayscale", "Grayscale"],
                  ["flip", "Flip vertically"],
                  ["flop", "Flip horizontally"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={key}
                    checked={Boolean(opts[key])}
                    onCheckedChange={(v) => setOpt(key, v === true)}
                  />
                  <Label htmlFor={key} className="font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={() => void apply()} loading={tool.busy}>
                {!tool.busy ? <Sparkles aria-hidden="true" /> : null}
                Preview edits
              </Button>
              <Button variant="outline" onClick={resetEdits} disabled={tool.busy}>
                <RotateCcw aria-hidden="true" />
                Reset
              </Button>
              <Button variant="secondary" onClick={download} disabled={!editedUrl}>
                <Save aria-hidden="true" />
                Save image
              </Button>
            </div>
          </div>
        ) : (
          <p className="flex flex-1 items-center justify-center text-center text-muted-foreground">
            Upload an image to start editing.
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
