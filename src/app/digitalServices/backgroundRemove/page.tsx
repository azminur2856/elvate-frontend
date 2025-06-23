"use client";
import { useRef, useState } from "react";
import api from "@/lib/authAxios";
import { toast } from "react-hot-toast";
import SubscriptionRequiredModal from "@/components/modal/SubscriptionRequiredModal";
import { FaTrash, FaMagic, FaSyncAlt, FaDownload } from "react-icons/fa";

const ACCEPTED = ["image/jpeg", "image/png", "image/jpg", "image/heic"];

export default function BackgroundRemovePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const [removedBgUrl, setRemovedBgUrl] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  // Modal state
  const [showSubModal, setShowSubModal] = useState(false);
  const [subMessage, setSubMessage] = useState<string>("");

  // File select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only JPG, PNG, or HEIC allowed.");
      return;
    }
    setSelectedFile(file);
    setRemovedBgUrl(null);

    // Preview
    const url = URL.createObjectURL(file);
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

  // Remove background
  const handleRemoveBg = async () => {
    toast("Feature coming soon!", { icon: "⏳" });
    // if (!selectedFile) return toast.error("Please upload an image.");
    // setRemoving(true);
    // setRemovedBgUrl(null);

    // try {
    //   const formData = new FormData();
    //   formData.append("file", selectedFile);

    //   const res = await api.post("/ocr/image/remove-bg", formData, {
    //     headers: { "Content-Type": "multipart/form-data" },
    //   });

    //   if (res.data && res.data.data) {
    //     setRemovedBgUrl(`data:${res.data.contentType};base64,${res.data.data}`);
    //     toast.success("Background removed!");
    //   } else {
    //     toast.error("Failed to remove background");
    //   }
    // } catch (err: any) {
    //   if (err?.response?.status === 403) {
    //     setShowSubModal(true);
    //     setSubMessage(
    //       err?.response?.data?.message ||
    //         "You must be subscribed to use background removal."
    //     );
    //   } else {
    //     toast.error(
    //       err?.response?.data?.message ||
    //         err?.message ||
    //         "Failed to remove background"
    //     );
    //   }
    // } finally {
    //   setRemoving(false);
    // }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setImgUrl(null);
    setRemovedBgUrl(null);
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
                <button
                  className="mt-3 px-4 py-2 text-xs bg-red-700 hover:bg-red-800 rounded-lg text-white flex items-center gap-2"
                  type="button"
                  onClick={handleRemove}
                >
                  <FaTrash size={13} /> Remove
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Middle: Remove BG */}
        <div className="flex flex-col items-center justify-center w-14 relative">
          <div className="w-px h-5/6 bg-neutral-700 mx-auto" />
          <button
            onClick={handleRemoveBg}
            disabled={removing || !selectedFile || !!removedBgUrl}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              bg-blue-700 hover:bg-blue-800 text-white rounded-full p-4 shadow-lg flex flex-col items-center group
              transition focus:outline-none z-20"
          >
            <span className="text-3xl flex items-center">
              {removing ? (
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
              Remove BG
            </span>
          </button>
        </div>
        {/* Right: Result */}
        <div className="w-1/2 h-full bg-neutral-800 flex flex-col items-center p-6 overflow-auto relative">
          {!removedBgUrl && (
            <div className="text-gray-400 flex-1 flex items-center justify-center text-center">
              &larr; Result will appear here
            </div>
          )}
          {removedBgUrl && (
            <div className="flex flex-col items-center w-full">
              <img
                src={removedBgUrl}
                alt="No BG Preview"
                className="rounded-lg border border-neutral-700 mb-3 max-w-full max-h-[350px] bg-neutral-900"
                style={{ background: "url('/checkerboard-bg.png')" }} // show transparency
              />
              <a
                href={removedBgUrl}
                download="no-bg.png"
                className="mt-2 px-6 py-2 text-sm bg-blue-700 hover:bg-blue-800 rounded-lg text-white flex items-center gap-2"
              >
                <FaDownload /> Download PNG
              </a>
              <button
                className="mt-3 px-4 py-2 text-xs bg-gray-700 hover:bg-gray-800 rounded-lg text-white flex items-center gap-2"
                onClick={handleRemove}
              >
                <FaSyncAlt /> Try Another
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
