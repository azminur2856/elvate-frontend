"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";

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
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(user);
      setError("");
    }
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
      toast.success("Profile updated.");
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update profile</DialogTitle>
          <DialogDescription>Change your name or phone number.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4">
          <FormField id="firstName" label="First name" required>
            <Input
              name="firstName"
              autoComplete="given-name"
              value={form.firstName || ""}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField id="lastName" label="Last name">
            <Input
              name="lastName"
              autoComplete="family-name"
              value={form.lastName || ""}
              onChange={handleChange}
            />
          </FormField>
          <FormField
            id="phone"
            label="Phone"
            hint="Bangladeshi number, e.g. 01712345678"
          >
            <Input
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={form.phone || ""}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              pattern="^01[3-9]\d{8}$"
              maxLength={11}
              title="Must be a valid Bangladeshi phone number"
            />
          </FormField>
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}
          <Button type="submit" className="w-full" loading={loading}>
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
