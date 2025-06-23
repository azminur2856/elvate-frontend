"use client";
import { useRef, useState } from "react";
import api from "@/lib/authAxios";
import { toast } from "react-hot-toast";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { FaTrash, FaMagic, FaSyncAlt } from "react-icons/fa";

const ACCEPTED = ["image/jpeg", "image/png", "image/jpg", "image/heic"];

const PRESETS = [
  { label: "PP (300x400px)", width: 300, height: 400 },
  { label: "3R (3.5x5in, 300dpi)", width: 1050, height: 1500 },
  { label: "4R (4x6in, 300dpi)", width: 1200, height: 1800 },
  { label: "Square (500x500)", width: 500, height: 500 },
];

export default function ImageResizePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number | null>(null);
  const [origHeight, setOrigHeight] = useState<number | null>(null);

  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [resizedLoading, setResizedLoading] = useState(false);

  // Modal state
  const [showSubModal, setShowSubModal] = useState(false);
  const [subMessage, setSubMessage] = useState<string>("");

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only JPG, PNG, or HEIC allowed.");
      return;
    }
    setSelectedFile(file);
    setResizedUrl(null);

    // Get image natural size
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setWidth(img.naturalWidth.toString());
      setHeight(img.naturalHeight.toString());
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setImgUrl(url);
  };

  // Drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleFileChange({ target: { files: [file] } } as any);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // Update width/height with aspect ratio lock
  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (keepAspect && aspectRatio && val) {
      const w = parseInt(val, 10);
      setHeight(w ? Math.round(w / aspectRatio).toString() : "");
    }
  };
  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (keepAspect && aspectRatio && val) {
      const h = parseInt(val, 10);
      setWidth(h ? Math.round(h * aspectRatio).toString() : "");
    }
  };

  // Resize
  const handleResize = async () => {
    if (!selectedFile) return toast.error("Please upload an image.");
    if (!width || !height) return toast.error("Please set width and height.");
    setResizedLoading(true);
    setResizedUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("width", width);
      formData.append("height", height);

      const res = await api.post("/ocr/image/resize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Show resized image (base64)
      if (res.data && res.data.data) {
        setResizedUrl(`data:${res.data.contentType};base64,${res.data.data}`);
        toast.success("Image resized!");
      } else {
        toast.error("Failed to resize image");
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setShowSubModal(true);
        setSubMessage(
          err?.response?.data?.message ||
            "You must be subscribed to use image resize."
        );
      } else {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to resize image"
        );
      }
    } finally {
      setResizedLoading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setImgUrl(null);
    setResizedUrl(null);
    setOrigWidth(null);
    setOrigHeight(null);
    setWidth("");
    setHeight("");
    setAspectRatio(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center pt-20 font-sans">
      <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden relative">
        {/* Left: Upload & Controls */}
        <div className="w-1/2 h-full bg-neutral-800 flex flex-col items-center justify-center p-6 border-r border-neutral-700 relative">
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.heic"
              className="hidden"
              onChange={handleFileChange}
            />
            {!selectedFile ? (
              <div
                className="w-full h-full p-6 border-2 border-dashed border-gray-600 rounded-lg bg-neutral-800 flex flex-col items-center justify-center cursor-pointer transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-4xl mb-2">🖼️</div>
                <div className="text-gray-300 text-center mb-1">
                  Drag and drop an image here,
                  <br />
                  or{" "}
                  <span className="underline text-blue-400">
                    click to browse
                  </span>
                </div>
                <div className="text-xs mt-2 text-gray-500">
                  (Accepted: .jpg, .jpeg, .png, .heic)
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-2">
                <img
                  src={imgUrl || ""}
                  alt="Preview"
                  className="max-h-56 max-w-full rounded-lg border border-neutral-700 object-contain bg-neutral-900"
                />
                <div className="text-gray-200 text-base mt-2 text-center break-words">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-gray-400 text-center">
                  {origWidth && origHeight
                    ? `Current: ${origWidth} x ${origHeight}px`
                    : ""}
                </div>
                {/* Custom size fields */}
                <div className="flex gap-2 items-center my-3">
                  <input
                    type="number"
                    min={16}
                    max={4096}
                    placeholder="Width"
                    className="w-20 rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-white text-sm"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                  />
                  <span className="text-gray-300">x</span>
                  <input
                    type="number"
                    min={16}
                    max={4096}
                    placeholder="Height"
                    className="w-20 rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-white text-sm"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                  />
                  <label className="flex items-center text-xs text-gray-400 ml-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keepAspect}
                      onChange={() => setKeepAspect(!keepAspect)}
                      className="mr-1"
                    />
                    Lock ratio
                  </label>
                </div>
                {/* Preset buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      className="bg-neutral-700 hover:bg-blue-700 text-white text-xs rounded px-2 py-1"
                      type="button"
                      onClick={() => {
                        setWidth(p.width.toString());
                        setHeight(p.height.toString());
                        setKeepAspect(false);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    className="bg-gray-700 hover:bg-red-800 text-white text-xs rounded px-2 py-1 flex items-center gap-1"
                    type="button"
                    onClick={handleRemove}
                  >
                    <FaTrash size={13} /> Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Middle: Resize */}
        <div className="flex flex-col items-center justify-center w-14 relative">
          <div className="w-px h-5/6 bg-neutral-700 mx-auto" />
          <button
            onClick={handleResize}
            disabled={
              resizedLoading ||
              !selectedFile ||
              !width ||
              !height ||
              (parseInt(width) === origWidth && parseInt(height) === origHeight)
            }
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              bg-blue-700 hover:bg-blue-800 text-white rounded-full p-4 shadow-lg flex flex-col items-center group
              transition focus:outline-none z-20"
          >
            <span className="text-3xl flex items-center">
              {resizedLoading ? (
                <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="white"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <FaMagic size={32} />
              )}
            </span>
            <span
              className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap bg-neutral-900 text-white
      px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity text-xs pointer-events-none"
            >
              Resize Image
            </span>
          </button>
        </div>
        {/* Right: Result */}
        <div className="w-1/2 h-full bg-neutral-800 flex flex-col items-center p-6 overflow-auto relative">
          {!resizedUrl && (
            <div className="text-gray-400 flex-1 flex items-center justify-center text-center">
              &larr; Resize to view here
            </div>
          )}
          {resizedUrl && (
            <div className="flex flex-col items-center w-full">
              <img
                src={resizedUrl}
                alt="Resized Preview"
                className="rounded-lg border border-neutral-700 mb-3 max-w-full max-h-[350px] bg-neutral-900"
              />
              <a
                href={resizedUrl}
                download="resized.jpg"
                className="mt-2 px-6 py-2 text-sm bg-blue-700 hover:bg-blue-800 rounded-lg text-white"
              >
                Download
              </a>
              <button
                className="mt-3 px-4 py-2 text-xs bg-gray-700 hover:bg-gray-800 rounded-lg text-white flex items-center gap-2"
                onClick={handleRemove}
              >
                <FaSyncAlt /> Resize Another
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Subscription Modal */}
      <SubscriptionRequiredModal
        open={showSubModal}
        message={subMessage}
        onClose={() => setShowSubModal(false)}
      />
    </div>
  );
}
