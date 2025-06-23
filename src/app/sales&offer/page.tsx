"use client";
import { FaTag } from "react-icons/fa";

export default function SalesAndOffersPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-lg px-8 py-12 flex flex-col items-center">
        <FaTag className="text-5xl text-pink-400 mb-4 animate-bounce" />
        <h1 className="text-3xl font-bold text-white mb-2">Sales & Offers</h1>
        <p className="text-neutral-300 max-w-md text-center mb-4">
          Exciting discounts and exclusive offers will be available here soon.
          Please check back later for amazing deals on Elvate products and
          services!
        </p>
        <span className="bg-pink-900/30 text-pink-300 px-4 py-1 rounded text-sm font-medium">
          Coming Soon • Under Development
        </span>
      </div>
    </div>
  );
}
