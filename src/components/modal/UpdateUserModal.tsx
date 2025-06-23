"use client";
import React, { useState } from "react";
import api from "@/lib/authAxios";
import { toast } from "react-hot-toast";

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  user: UpdateUserData;
  onSuccess: () => void;
};

export default function UpdateUserModal({
  open,
  onClose,
  user,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<UpdateUserData>(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Keep form fields in sync when modal reopens
  // (e.g., user updates and reopens modal)
  React.useEffect(() => {
    if (open) setForm(user);
  }, [open, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.patch("/users/updateUser", {
        ...form,
        phone: form.phone ? form.phone : undefined,
      });
      setLoading(false);
      toast.success("Profile updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      //   setError(
      //     err?.response?.data?.message ||
      //       err?.response?.data?.error ||
      //       err?.message ||
      //       "Failed to update profile."
      //   );
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update profile.";
      setError(msg);
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
          Update Profile
        </h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName || ""}
              onChange={handleChange}
              className="block w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName || ""}
              onChange={handleChange}
              className="block w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              className="block w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-3 py-2 focus:ring focus:ring-blue-500 focus:outline-none"
              pattern="^01[3-9]\d{8}$"
              maxLength={11}
              title="Must be a valid Bangladeshi phone number"
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
