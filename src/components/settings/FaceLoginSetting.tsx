"use client";

import { useState } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { FaceReferenceResult } from "@/types/face";
import { FACE_SETUP_TEXT } from "@/components/modal/FaceVerificationModal";
import { useFeatureFlags } from "@/components/settings/FeatureFlagsProvider";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * Face login status with a way out: "Remove" deletes the private reference
 * photo (`DELETE /users/face-reference`, SEC-04; it keeps working while the
 * admin switch is off, BE-27). Setting it up again happens on the profile page.
 */
export function FaceLoginSetting({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  const { faceLoginEnabled, loading: flagsLoading } = useFeatureFlags();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  // Read as off while loading (FE-27); the "unavailable" notes wait for the answer.
  const switchedOff = !faceLoginEnabled && !flagsLoading;

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
    <div className="grid gap-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {enabled ? (
          <>
            <StatusBadge ok okLabel={faceLoginEnabled ? "On" : "Set up"} noLabel="Off" />
            {switchedOff ? <Badge variant="secondary">Temporarily unavailable</Badge> : null}
            <Button variant="link" size="sm" className="h-auto p-0 text-destructive" onClick={() => setConfirmOpen(true)}>
              Remove
            </Button>
          </>
        ) : (
          <>
            <StatusBadge ok={false} okLabel="On" noLabel="Off" />
            {faceLoginEnabled ? (
              <Button asChild variant="link" size="sm" className="h-auto p-0 text-link">
                <Link href="/profile">Set up on your profile</Link>
              </Button>
            ) : null}
          </>
        )}
      </div>
      {switchedOff ? (
        <p className="text-sm font-normal text-muted-foreground">
          {enabled
            ? "Face login has been temporarily disabled. Your setup is saved and will work again as soon as it's re-enabled."
            : FACE_SETUP_TEXT.unavailable}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => !removing && setConfirmOpen(open)}
        title="Remove face login?"
        description={
          faceLoginEnabled
            ? "Your private face photo will be permanently deleted. You can set up face login again at any time from your profile."
            : "Your private face photo will be permanently deleted from your account."
        }
        confirmLabel="Remove face login"
        destructive
        loading={removing}
        onConfirm={remove}
      >
        {!faceLoginEnabled ? (
          <div className="flex gap-2 rounded-lg bg-warning/15 p-3 text-sm">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              Face login is currently disabled by the administrator. If you remove it now, you won&apos;t be able to set
              it up again until face login is re-enabled. At that point, you&apos;ll need to complete face verification
              again (profile picture, password and camera check).
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
