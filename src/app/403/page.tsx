// app/forbidden/page.tsx
"use client";
import { FaBan } from "react-icons/fa";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <FaBan className="text-red-500 text-7xl mb-6" />
      <h1 className="text-5xl font-bold mb-2">403 Forbidden</h1>
      <p className="mb-4 text-xl">
        You are not an admin and cannot access this page.
      </p>
    </div>
  );
}
