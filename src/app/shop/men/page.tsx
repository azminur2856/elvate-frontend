"use client";
import { FaMale } from "react-icons/fa";

export default function MenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-lg px-8 py-12 flex flex-col items-center">
        <FaMale className="text-5xl text-blue-400 mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-white mb-2">
          Men's Collection Coming Soon!
        </h1>
        <p className="text-neutral-300 max-w-md text-center mb-4">
          The Elvate men's collection is under development and will be launching
          soon. Stay tuned for an exciting selection of products and exclusive
          offers tailored for men!
        </p>
        <span className="bg-blue-900/30 text-blue-300 px-4 py-1 rounded text-sm font-medium">
          Under Development
        </span>
      </div>
    </div>
  );
}
