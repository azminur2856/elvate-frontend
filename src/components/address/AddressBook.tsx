"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/commerce";
import { AddressLines } from "@/components/orders/OrderParts";
import { EmptyState } from "@/components/shop/EmptyState";
import { FormMessage } from "@/components/forms/FormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressForm } from "./AddressForm";

/** Address summary with label, default and Dhaka badges. */
export function AddressCard({ address, children }: { address: Address; children?: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{address.label || "Address"}</span>
        {address.isDefault ? <Badge variant="secondary">Default</Badge> : null}
        <Badge variant="outline">{address.isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka"}</Badge>
      </div>
      <AddressLines address={address} />
      {children ? <div className="mt-auto flex flex-wrap gap-1 pt-1">{children}</div> : null}
    </div>
  );
}

type AddressBookProps = {
  /** "manage" = settings page; "select" = checkout (radio choice). */
  mode?: "manage" | "select";
  selectedId?: string | null;
  onSelect?: (address: Address) => void;
  /** Called whenever the list changes (after load / add / edit / delete). */
  onChange?: (addresses: Address[]) => void;
  className?: string;
};

/**
 * Saved addresses: list, add, edit, delete, set default
 * (`/addresses`). In select mode each card is a radio option.
 */
export function AddressBook({ mode = "manage", selectedId, onSelect, onChange, className }: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);
  const [busy, setBusy] = useState(false);
  // Remember the last mode so the title doesn't flip while the dialog closes.
  const [dialogMode, setDialogMode] = useState<"new" | "edit">("new");
  useEffect(() => {
    if (editing !== null) setDialogMode(editing === "new" ? "new" : "edit");
  }, [editing]);

  const update = useCallback(
    (list: Address[]) => {
      // Default first, like the API.
      const sorted = [...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
      setAddresses(sorted);
      onChange?.(sorted);
    },
    [onChange]
  );

  useEffect(() => {
    let cancelled = false;
    api
      .get<Address[]>("/addresses")
      .then((res) => !cancelled && update(res.data))
      .catch((err) => {
        if (cancelled) return;
        setAddresses([]);
        setError(getErrorMessage(err, "Could not load your addresses."));
      });
    return () => {
      cancelled = true;
    };
    // Load once; `update` only changes if the parent passes a new onChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saved = (a: Address) => {
    const list = addresses ?? [];
    const exists = list.some((x) => x.id === a.id);
    let next = exists ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a];
    if (a.isDefault) next = next.map((x) => (x.id === a.id ? x : { ...x, isDefault: false }));
    update(next);
    setEditing(null);
    toast.success(exists ? "Address updated." : "Address saved.");
    if (mode === "select") onSelect?.(a);
  };

  const makeDefault = async (a: Address) => {
    setBusy(true);
    try {
      const res = await api.patch<Address[]>(`/addresses/${a.id}/default`);
      update(res.data);
      toast.success("Default address updated.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the default address."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/addresses/${deleting.id}`);
      update((addresses ?? []).filter((x) => x.id !== deleting.id));
      toast.success("Address deleted.");
      setDeleting(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the address."));
    } finally {
      setBusy(false);
    }
  };

  const actions = (a: Address) => (
    <>
      <Button variant="ghost" size="sm" onClick={() => setEditing(a)} aria-label={`Edit ${a.label || "address"} of ${a.fullName}`}>
        <Pencil aria-hidden="true" />
        Edit
      </Button>
      {mode === "manage" && !a.isDefault ? (
        <Button variant="ghost" size="sm" onClick={() => makeDefault(a)} disabled={busy}>
          <Star aria-hidden="true" />
          Make default
        </Button>
      ) : null}
      {mode === "manage" ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => setDeleting(a)}
          aria-label={`Delete ${a.label || "address"} of ${a.fullName}`}
        >
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      ) : null}
    </>
  );

  return (
    <div className={cn("grid gap-4", className)}>
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}

      {addresses === null ? (
        <div role="status" aria-label="Loading addresses" className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      ) : addresses.length === 0 && !error ? (
        <EmptyState
          icon={MapPin}
          as="h3"
          title="No saved addresses"
          description="Add the address where you'd like your orders delivered."
          action={
            <Button onClick={() => setEditing("new")}>
              <Plus aria-hidden="true" />
              Add address
            </Button>
          }
        />
      ) : mode === "select" ? (
        <fieldset>
          <legend className="sr-only">Delivery address</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => {
              const checked = selectedId === a.id;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "relative rounded-xl border bg-card p-4 transition-colors",
                    checked ? "border-primary ring-1 ring-primary" : "hover:border-input"
                  )}
                >
                  <label className="absolute inset-0 cursor-pointer rounded-xl">
                    <input
                      type="radio"
                      name="delivery-address"
                      value={a.id}
                      checked={checked}
                      onChange={() => onSelect?.(a)}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 rounded-xl peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
                    <span className="sr-only">
                      Deliver to {a.fullName}, {a.addressLine}, {a.city}
                    </span>
                  </label>
                  <div className="pointer-events-none flex gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                        checked ? "border-primary" : "border-input"
                      )}
                    >
                      {checked ? <span className="size-2 rounded-full bg-primary" /> : null}
                    </span>
                    <div className="min-w-0 flex-1 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
                      <AddressCard address={a}>
                        <span className="relative z-10">{actions(a)}</span>
                      </AddressCard>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-xl border bg-card p-4">
              <AddressCard address={a}>{actions(a)}</AddressCard>
            </li>
          ))}
        </ul>
      )}

      {addresses && addresses.length > 0 ? (
        <Button variant="outline" className="justify-self-start" onClick={() => setEditing("new")}>
          <Plus aria-hidden="true" />
          Add a new address
        </Button>
      ) : null}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === "new" ? "Add an address" : "Edit address"}</DialogTitle>
            <DialogDescription>We deliver all over Bangladesh. Delivery inside Dhaka is cheaper and faster.</DialogDescription>
          </DialogHeader>
          {editing !== null ? (
            <AddressForm
              address={editing === "new" ? null : editing}
              onSaved={saved}
              onCancel={() => setEditing(null)}
              showDefault={!(editing === "new" && (addresses?.length ?? 0) === 0)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && !busy && setDeleting(null)}
        title="Delete this address?"
        description={deleting ? `${deleting.fullName}, ${deleting.addressLine}, ${deleting.city}` : undefined}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
      />
    </div>
  );
}
