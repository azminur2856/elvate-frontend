"use client";
import api from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post(`/auth/login`, {
        email,
        password,
      });
      if (res.status === 200) {
        window.location.href = "/profile";
      } else {
        setError(res.data?.message || "Invalid login credentials");
      }
    } catch (error: any) {
      // Show detailed error messages from backend (UnauthorizedException)
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Invalid login credentials";
      setError(message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google/login`;
  };

  const handleFaceLogin = () => {
    window.location.href = "/faceLogin";
  };

  return (
    <div className="bg-neutral-900/95 border border-neutral-800 shadow-2xl p-8 rounded-2xl w-full max-w-md flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow">
        Login
      </h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-full">
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-200"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-gray-100 placeholder-gray-400 rounded-md px-3 py-2 shadow focus:ring focus:ring-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-200"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-gray-100 placeholder-gray-400 rounded-md px-3 py-2 shadow focus:ring focus:ring-blue-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>
        <Link
          className="text-sm underline text-blue-400 hover:text-blue-300 text-right mb-1"
          href="/forgotPassword"
        >
          Forgot your password?
        </Link>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
        <button
          type="button"
          className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 transition"
          onClick={handleGoogleLogin}
        >
          Login with Google
        </button>
        <button
          type="button"
          className="w-full bg-neutral-700 text-white py-2 rounded-md font-semibold hover:bg-neutral-600 transition"
          onClick={handleFaceLogin}
        >
          Face Login
        </button>
        <div className="flex justify-between text-sm mt-2 text-gray-300">
          <span>Don&apos;t have an account?</span>
          <Link
            href="/signup"
            className="underline text-blue-400 hover:text-blue-300"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
