"use client";
import { useRef, useState } from "react";
import api from "@/lib/authAxios";
import { toast } from "react-hot-toast";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { FaTrash, FaSlidersH, FaUndo, FaMagic, FaSave } from "react-icons/fa";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";

type EditOptions = {
  crop?: { left: number; top: number; width: number; height: number };
  resize?: { width: number; height: number };
  rotate?: number;
  brightness?: number;
  contrast?: number;
  grayscale?: boolean;
  flip?: boolean;
  flop?: boolean;
  blur?: number;
};

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/heic"];

const DEFAULT_EDIT: EditOptions = {
  brightness: 1,
  contrast: 1,
  grayscale: false,
  flip: false,
  flop: false,
  blur: 0,
  rotate: 0,
};

export default function ImageEditPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [editOpts, setEditOpts] = useState<EditOptions>({ ...DEFAULT_EDIT });
  const [uploading, setUploading] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subMessage, setSubMessage] = useState<string>("");

  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Load original preview on upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Unsupported file type.");
      return;
    }
    setSelectedFile(file);
    setEditOpts({ ...DEFAULT_EDIT });
    setImgUrl(URL.createObjectURL(file));
    setEditedUrl(null);
    setCropMode(false);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // Drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Unsupported file type.");
      return;
    }
    setSelectedFile(file);
    setEditOpts({ ...DEFAULT_EDIT });
    setImgUrl(URL.createObjectURL(file));
    setEditedUrl(null);
    setCropMode(false);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // Reset all
  const handleReset = () => {
    setEditOpts({ ...DEFAULT_EDIT });
    setEditedUrl(null);
    setCropMode(false);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // Apply edits by sending to backend and get preview
  const handleApply = async () => {
    if (!selectedFile) return;

    // If crop is enabled and a crop area is selected, update editOpts.crop
    let finalEditOpts = { ...editOpts };
    if (cropMode && croppedAreaPixels) {
      finalEditOpts.crop = {
        left: Math.round(croppedAreaPixels.x),
        top: Math.round(croppedAreaPixels.y),
        width: Math.round(croppedAreaPixels.width),
        height: Math.round(croppedAreaPixels.height),
      };
    } else {
      finalEditOpts.crop = undefined;
    }

    setUploading(true);
    setEditedUrl(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("options", JSON.stringify(finalEditOpts));
      const res = await api.post("/ocr/image/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditedUrl(`data:${res.data.contentType};base64,${res.data.data}`);
      toast.success("Preview updated!");
      if (cropMode) setCropMode(false);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setShowSubModal(true);
        setSubMessage(
          err?.response?.data?.message ||
            "You must be subscribed to use this feature."
        );
      } else {
        toast.error(
          err?.response?.data?.message || err?.message || "Failed to edit image"
        );
      }
    } finally {
      setUploading(false);
    }
  };

  // Save/download image (after editing)
  const handleDownload = () => {
    if (!editedUrl) return;
    const link = document.createElement("a");
    link.href = editedUrl;
    link.download = "edited-image.png";
    link.click();
  };

  // Remove image
  const handleRemove = () => {
    setSelectedFile(null);
    setImgUrl(null);
    setEditedUrl(null);
    setEditOpts({ ...DEFAULT_EDIT });
    setCropMode(false);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // UI helpers
  const setOpt = (k: keyof EditOptions, v: any) =>
    setEditOpts((opts) => ({ ...opts, [k]: v }));

  // If not selected, show upload box
  if (!selectedFile) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center pt-20 font-sans">
        <div
          className="w-full max-w-lg p-8 rounded-2xl shadow-2xl border border-neutral-800 bg-neutral-900/95 flex flex-col items-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            Photo Editor
          </h2>
          <p className="text-gray-400 mb-6 text-center">
            Add effects, crop, resize, and enhance your images.
          </p>
          <div
            className="w-full p-6 border-2 border-dashed rounded-lg bg-neutral-800 flex flex-col items-center justify-center mb-4 transition cursor-pointer border-gray-600"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-gray-300 text-center">
              <div className="text-4xl mb-2">🖼️</div>
              Drag & drop or{" "}
              <span className="underline text-blue-400">click to browse</span>
              <div className="text-xs mt-2 text-gray-500">
                (Accepted: .jpg, .jpeg, .png, .heic)
              </div>
            </div>
          </div>
        </div>
        <SubscriptionRequiredModal
          open={showSubModal}
          message={subMessage}
          onClose={() => setShowSubModal(false)}
        />
      </div>
    );
  }

  // Editor Panel
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center pt-20 font-sans">
      <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[600px] flex overflow-hidden relative">
        {/* Left: Image preview & upload */}
        <div className="w-1/2 h-full bg-neutral-800 flex flex-col items-center justify-center p-4 overflow-auto border-r border-neutral-700 relative">
          <div className="w-full flex flex-col items-center">
            {/* Visual Cropper */}
            {cropMode && imgUrl ? (
              <div
                className="relative mb-3 rounded-lg border border-neutral-700"
                style={{ width: 320, height: 320, background: "#222" }}
              >
                <Cropper
                  image={editedUrl || imgUrl || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3} // or remove for "free" aspect
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, cropped) => setCroppedAreaPixels(cropped)}
                  cropShape="rect"
                  showGrid={true}
                />
                <div className="absolute bottom-2 left-2 right-2 flex gap-2 items-center">
                  <label className="text-gray-400">Zoom:</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              <img
                src={editedUrl || imgUrl || ""}
                alt="Preview"
                className="max-h-96 rounded-lg border border-neutral-700 object-contain bg-neutral-900 mb-3"
                style={{ width: "100%", maxWidth: "350px" }}
              />
            )}
            <div className="text-gray-200 text-base mt-2 text-center break-words">
              {selectedFile.name}
            </div>
            <div className="text-xs text-gray-400 text-center">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </div>
            <button
              className="mt-4 px-6 py-2 text-sm bg-red-700 hover:bg-red-800 rounded-lg text-white flex items-center gap-2"
              type="button"
              onClick={handleRemove}
            >
              <FaTrash size={14} /> Remove
            </button>
          </div>
        </div>
        {/* Right: Controls */}
        <div className="w-1/2 h-full flex flex-col items-start justify-start p-6 bg-neutral-900">
          <div className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
            <FaSlidersH className="text-blue-400" />
            Image Adjustments
          </div>
          <div className="flex flex-col gap-3 w-full">
            {/* Enable Crop */}
            <label className="text-gray-300 flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={cropMode}
                onChange={(e) => {
                  setCropMode(e.target.checked);
                  if (!e.target.checked) {
                    setCroppedAreaPixels(null);
                    setOpt("crop", undefined); // disable crop in options
                  }
                }}
              />
              Enable Crop (use mouse to select area)
            </label>
            {/* Manual Resize */}
            <div>
              <label className="text-gray-300">Resize (px):</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  className="w-20 rounded p-1 bg-neutral-800 border border-neutral-600 text-white"
                  placeholder="Width"
                  min={1}
                  value={editOpts.resize?.width || ""}
                  onChange={(e) =>
                    setOpt("resize", {
                      ...editOpts.resize,
                      width: Number(e.target.value) || undefined,
                      height: editOpts.resize?.height,
                    })
                  }
                />
                <span className="text-gray-500">x</span>
                <input
                  type="number"
                  className="w-20 rounded p-1 bg-neutral-800 border border-neutral-600 text-white"
                  placeholder="Height"
                  min={1}
                  value={editOpts.resize?.height || ""}
                  onChange={(e) =>
                    setOpt("resize", {
                      ...editOpts.resize,
                      width: editOpts.resize?.width,
                      height: Number(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>
            {/* Rotate */}
            <div>
              <label className="text-gray-300">Rotate (°):</label>
              <input
                type="number"
                className="w-20 ml-2 rounded p-1 bg-neutral-800 border border-neutral-600 text-white"
                min={-360}
                max={360}
                value={editOpts.rotate || 0}
                onChange={(e) => setOpt("rotate", Number(e.target.value))}
              />
            </div>
            {/* Brightness */}
            <div>
              <label className="text-gray-300">Brightness:</label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={editOpts.brightness ?? 1}
                onChange={(e) => setOpt("brightness", Number(e.target.value))}
                className="w-32 ml-2"
              />
              <span className="text-gray-400 ml-2">
                {editOpts.brightness?.toFixed(2)}
              </span>
            </div>
            {/* Contrast */}
            <div>
              <label className="text-gray-300">Contrast:</label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={editOpts.contrast ?? 1}
                onChange={(e) => setOpt("contrast", Number(e.target.value))}
                className="w-32 ml-2"
              />
              <span className="text-gray-400 ml-2">
                {editOpts.contrast?.toFixed(2)}
              </span>
            </div>
            {/* Blur */}
            <div>
              <label className="text-gray-300">Blur:</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={editOpts.blur ?? 0}
                onChange={(e) => setOpt("blur", Number(e.target.value))}
                className="w-32 ml-2"
              />
              <span className="text-gray-400 ml-2">
                {editOpts.blur?.toFixed(1)}
              </span>
            </div>
            {/* Grayscale, Flip, Flop */}
            <div className="flex items-center gap-6 mt-2">
              <label className="text-gray-300 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editOpts.grayscale || false}
                  onChange={(e) => setOpt("grayscale", e.target.checked)}
                />
                Grayscale
              </label>
              <label className="text-gray-300 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editOpts.flip || false}
                  onChange={(e) => setOpt("flip", e.target.checked)}
                />
                Flip (vertical)
              </label>
              <label className="text-gray-300 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editOpts.flop || false}
                  onChange={(e) => setOpt("flop", e.target.checked)}
                />
                Flop (horizontal)
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                onClick={handleApply}
                disabled={uploading}
                title="Preview Edits"
              >
                <FaMagic /> {uploading ? "Processing..." : "Preview"}
              </button>
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg flex items-center gap-2"
                onClick={handleReset}
                disabled={uploading}
                title="Reset"
              >
                <FaUndo /> Reset
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                onClick={handleDownload}
                disabled={!editedUrl}
                title="Save Image"
              >
                <FaSave /> Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <SubscriptionRequiredModal
        open={showSubModal}
        message={subMessage}
        onClose={() => setShowSubModal(false)}
      />
    </div>
  );
}
