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

  useEffect(() => {
    if (open) {
      setOldPassword("");
      setNewPassword("");
      setRePassword("");
      setErrMsg("");
    }
  }, [open]);

  const mismatch =
    newPassword.length > 0 && rePassword.length > 0 && newPassword !== rePassword;

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
      await api.patch("/auth/changePassword", { oldPassword, newPassword });
      toast.success("Password changed. Please log in again.");
      onClose();
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      setErrMsg(getErrorMessage(err, "Failed to change password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            You will be signed out of every device after the change.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <FormField id="old-password" label="Current password" required>
            <Input
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoFocus
            />
          </FormField>
          <FormField
            id="new-password"
            label="New password"
            hint="At least 6 characters."
            required
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormField>
          <FormField
            id="re-password"
            label="Re-enter new password"
            error={mismatch ? "New passwords do not match." : undefined}
            required
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
            />
          </FormField>
          {errMsg ? <FormMessage variant="error">{errMsg}</FormMessage> : null}
          <Button type="submit" className="w-full" loading={loading}>
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
