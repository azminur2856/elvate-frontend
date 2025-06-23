"use client";
import { useRef, useState } from "react";
import api from "@/lib/authAxios";
import { toast } from "react-hot-toast";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { FaCopy, FaTrash, FaMagic } from "react-icons/fa";

// Accepted image mime types
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/heic"];

export default function OCRImagePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Modal state
  const [showSubModal, setShowSubModal] = useState(false);
  const [subMessage, setSubMessage] = useState<string>("");

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only JPG, PNG, or HEIC images are allowed.");
      return;
    }
    setSelectedFile(file);
    setOcrResult(null);
  };

  // Drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only JPG, PNG, or HEIC images are allowed.");
      return;
    }
    setSelectedFile(file);
    setOcrResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Extract text
  const handleExtract = async () => {
    if (!selectedFile) return toast.error("Please select an image file first.");
    setUploading(true);
    setOcrResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await api.post("/ocr/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOcrResult(res.data?.text || "");
      toast.success("Text extracted successfully!");
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setShowSubModal(true);
        setSubMessage(
          err?.response?.data?.message ||
            "You must be subscribed to use OCR feature."
        );
      } else {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to extract text"
        );
      }
    } finally {
      setUploading(false);
    }
  };

  // Copy extracted text
  const handleCopy = async () => {
    if (!ocrResult) return;
    try {
      const textarea = document.createElement("textarea");
      textarea.value = ocrResult;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Text copied!");
    } catch {
      toast.error("Failed to copy text.");
    }
  };

  // Remove file
  const handleRemove = () => {
    setSelectedFile(null);
    setOcrResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center pt-20 font-sans">
      <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[600px] flex overflow-hidden relative">
        {/* Left Panel: Upload/Preview */}
        <div className="w-1/2 h-full bg-neutral-800 flex flex-col items-center justify-center p-4 overflow-auto border-r border-neutral-700 relative">
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
                  Drag and drop an image file here,
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
                {/* Image Preview */}
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="max-h-[420px] max-w-full rounded-lg border border-neutral-700 object-contain bg-neutral-900"
                  onLoad={(e) =>
                    URL.revokeObjectURL((e.target as HTMLImageElement).src)
                  }
                />
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
            )}
          </div>
        </div>
        {/* Vertical Divider & Extract Button */}
        <div className="flex flex-col items-center justify-center w-14 relative">
          <div className="w-px h-5/6 bg-neutral-700 mx-auto" />
          <button
            onClick={handleExtract}
            disabled={uploading || !selectedFile || !!ocrResult}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              bg-blue-700 hover:bg-blue-800 text-white rounded-full p-4 shadow-lg flex flex-col items-center group
              transition focus:outline-none z-20"
          >
            <span className="text-3xl flex items-center">
              {uploading ? (
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
              Extract Text
            </span>
          </button>
        </div>
        {/* OCR Result Panel */}
        <div className="w-1/2 h-full bg-neutral-800 flex flex-col items-center p-4 overflow-auto relative">
          {/* Copy Button */}
          {ocrResult && (
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 bg-neutral-900 bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition text-white flex items-center gap-2 z-10"
              title="Copy extracted text"
            >
              <FaCopy />
              <span className="hidden sm:inline">Copy</span>
            </button>
          )}
          {!ocrResult && !uploading && (
            <div className="text-gray-400 flex-1 flex items-center justify-center">
              &larr; Extract text to view here
            </div>
          )}
          {uploading && (
            <div className="text-gray-300 flex-1 flex items-center justify-center">
              Extracting text...
            </div>
          )}
          {ocrResult && (
            <textarea
              className="w-full h-full rounded-lg bg-neutral-900 text-gray-100 border border-neutral-700 p-3"
              value={ocrResult}
              readOnly
            />
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
