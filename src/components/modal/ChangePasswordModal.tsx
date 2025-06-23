"use client";
import React, { useState } from "react";
import api from "@/lib/authAxios";
import { toast } from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Reset state when modal is opened/closed
  React.useEffect(() => {
    if (open) {
      setOldPassword("");
      setNewPassword("");
      setRePassword("");
      setErrMsg("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    if (!oldPassword || !newPassword || !rePassword) {
      setErrMsg("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setErrMsg("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== rePassword) {
      setErrMsg("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/auth/changePassword", {
        oldPassword,
        newPassword,
      });
      toast.success("Password changed successfully! Please login again.");
      setLoading(false);
      onClose();
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to change password.";
      setErrMsg(msg);
      toast.error(msg);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-700 w-full max-w-sm shadow-lg relative animate-fade-in">
        <button
          className="absolute top-3 right-5 text-2xl text-gray-400 hover:text-gray-100"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-white text-center">
          Change Password
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Old Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="block w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Re-enter New Password
            </label>
            <input
              type="password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              className="block w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
            />
            {newPassword && rePassword && newPassword !== rePassword && (
              <span className="text-xs text-red-400">
                New passwords do not match.
              </span>
            )}
          </div>
          {errMsg && (
            <div className="text-red-400 text-sm text-center">{errMsg}</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Changing..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
