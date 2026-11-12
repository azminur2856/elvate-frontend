"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { FaceReferenceResult } from "@/types/face";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * Face login status with a way out: "Remove" deletes the private reference
 * photo (`DELETE /users/face-reference`, SEC-04). Setting it up again
 * happens on the profile page.
 */
export function FaceLoginSetting({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const remove = async () => {
    setRemoving(true);
    try {
      const res = await api.delete<FaceReferenceResult>("/users/face-reference");
      onChange(Boolean(res.data?.faceLoginEnabled));
      toast.success("Face login removed. Your face photo was deleted.");
      setConfirmOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not remove face login."));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <StatusBadge ok={enabled} okLabel="On" noLabel="Off" />
      {enabled ? (
        <Button variant="link" size="sm" className="h-auto p-0 text-destructive" onClick={() => setConfirmOpen(true)}>
          Remove
        </Button>
      ) : (
        <Button asChild variant="link" size="sm" className="h-auto p-0 text-link">
          <Link href="/profile">Set up on your profile</Link>
        </Button>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => !removing && setConfirmOpen(open)}
        title="Remove face login?"
        description="Your private face photo is deleted and you can no longer log in with your face. You can set it up again from your profile."
        confirmLabel="Remove"
        destructive
        loading={removing}
        onConfirm={remove}
      />
    </div>
  );
}
