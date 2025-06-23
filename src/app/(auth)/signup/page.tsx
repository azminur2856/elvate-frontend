"use client";
import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api"; // Adjust your path

const initialState = {
  firstName: "",
  lastName: "",
  dob: "",
  email: "",
  phone: "",
  password: "",
  rePassword: "",
  terms: false,
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Check passwords match in real time if either password field changes
    if (name === "password" || name === "rePassword") {
      const newPassword = name === "password" ? value : form.password;
      const newRePassword = name === "rePassword" ? value : form.rePassword;
      if (newPassword && newRePassword && newPassword !== newRePassword) {
        setPasswordMatchError("Passwords do not match.");
      } else {
        setPasswordMatchError("");
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side checks
    if (!form.terms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }
    if (!form.password || !form.rePassword) {
      setError("Please enter and confirm your password.");
      return;
    }
    if (form.password !== form.rePassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const { rePassword, terms, ...payload } = form;
      const res = await api.post("/users/createUser", {
        ...payload,
        dob: form.dob ? form.dob : undefined,
        phone: form.phone ? form.phone : undefined,
      });
      setSuccess(
        res.data.message || "Registration successful. Check your email!"
      );
      setShowModal(true);
      setForm(initialState);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed";
      setError(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="mt-32 bg-neutral-900/95 border border-neutral-800 shadow-2xl p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Register
        </h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-400 text-center">{error}</div>
          )}
          {success && (
            <div className="text-sm text-green-400 text-center">{success}</div>
          )}

          {/* First row: First Name & Last Name */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-200">
                First Name
              </label>
              <input
                className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                placeholder="First Name"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-200">
                Last Name
              </label>
              <input
                className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
              />
            </div>
          </div>

          {/* Second row: Email & Phone */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-200">
                Email
              </label>
              <input
                className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-200">
                Phone
              </label>
              <input
                className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone (optional)"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Date of Birth
            </label>
            <input
              className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
            />
          </div>

          {/* Passwords */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Password
            </label>
            <input
              className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Re-enter Password
            </label>
            <input
              className="mt-1 block w-full border border-neutral-700 bg-neutral-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
              type="password"
              name="rePassword"
              value={form.rePassword}
              onChange={handleChange}
              required
              placeholder="Re-enter Password"
              autoComplete="new-password"
            />
          </div>
          {passwordMatchError && (
            <div className="text-xs text-red-400 mt-1">
              {passwordMatchError}
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
              className="mr-2"
              required
            />
            <label htmlFor="terms" className="text-gray-300 text-sm">
              I agree to the{" "}
              <Link
                href="/terms"
                className="underline text-blue-400 hover:text-blue-300"
                target="_blank"
              >
                Terms & Conditions
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={
              !form.firstName ||
              !form.lastName ||
              !form.email ||
              !form.password ||
              !form.rePassword ||
              !form.terms ||
              !!passwordMatchError
            }
          >
            Register
          </button>
        </form>
        <div className="flex justify-between text-sm mt-4 text-gray-300">
          <span>Already have an account?</span>
          <Link
            href="/login"
            className="underline text-blue-400 hover:text-blue-300"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Modal on Success */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-neutral-900 p-8 rounded-xl shadow-xl border border-neutral-800 max-w-sm w-full">
            <h3 className="text-xl font-bold text-green-400 mb-2 text-center">
              Account created successfully
            </h3>
            <p className="text-gray-100 mb-6 text-center">{success}</p>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
