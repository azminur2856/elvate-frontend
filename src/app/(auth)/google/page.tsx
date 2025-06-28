"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GoogleLoginSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown === 0) {
      router.replace("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-neutral-900/95 border border-neutral-800 shadow-2xl p-8 rounded-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-400">
          Google Login Successful!
        </h2>
        <p className="text-gray-200 mb-6">
          Welcome! You are now logged in with your Google account.
        </p>
        <div className="mb-4">
          Redirecting to your home in{" "}
          <span className="font-semibold">{countdown}</span> seconds...
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          onClick={() => router.replace("/")}
        >
          Go to Home Now
        </button>
      </div>
    </div>
  );
}
