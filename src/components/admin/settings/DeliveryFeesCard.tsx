"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Info, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import {
  checkShippingForm,
  sameFees,
  shippingExample,
  toShippingForm,
  type ShippingField,
  type ShippingForm,
} from "@/lib/shipping";
import type { ShippingSettings } from "@/types/settings";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { LocalTime } from "@/components/shared/LocalTime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const FIELDS: { key: ShippingField; label: string; hint?: string }[] = [
  { key: "insideDhaka", label: "Inside Dhaka (৳)" },
  { key: "outsideDhaka", label: "Outside Dhaka (৳)" },
  { key: "freeThreshold", label: "Free delivery from (৳)", hint: "0 = no free delivery" },
];

const EMPTY: ShippingForm = { insideDhaka: "", outsideDhaka: "", freeThreshold: "" };

/**
 * Admin → Settings: the three delivery numbers (FE-30 / BE-30,
 * `GET` / `PATCH /admin/settings/shipping`, ADMIN only).
 */
export function DeliveryFeesCard({ onSaved }: { onSaved?: () => void }) {
  const [saved, setSaved] = useState<ShippingSettings | null>(null);
  const [form, setForm] = useState<ShippingForm>(EMPTY);
  const [loadError, setLoadError] = useState("");
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const show = (settings: ShippingSettings) => {
    setSaved(settings);
    setForm(toShippingForm(settings));
    setApiError("");
  };

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const res = await api.get<ShippingSettings>("/admin/settings/shipping");
      show(res.data);
    } catch (err) {
      setSaved(null);
      setLoadError(
        isAxiosError(err) && err.response?.status === 404
          ? "Delivery fees can't be changed on this server yet."
          : getErrorMessage(err, "Could not load the delivery fees.")
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const { fees, errors } = checkShippingForm(form);
  const edited = saved !== null && Object.entries(toShippingForm(saved)).some(([k, v]) => form[k as ShippingField] !== v);
  const canSave = saved !== null && fees !== null && !sameFees(fees, saved) && !saving;

  const change = (key: ShippingField, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setApiError("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || !fees) return;
    setSaving(true);
    try {
      const res = await api.patch<ShippingSettings>("/admin/settings/shipping", fees);
      show(res.data);
      toast.success("Delivery fees updated.");
      onSaved?.();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setApiError(getErrorMessage(err, "Check the delivery fees."));
      } else {
        toast.error(getErrorMessage(err, "Could not save the delivery fees."));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-base font-semibold">Delivery fees</h2>
        </CardTitle>
        <CardDescription>
          What customers pay for delivery. New fees apply to new checkouts; orders already placed keep their fee.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadError ? (
          <div className="grid justify-items-start gap-3">
            <FormMessage variant="error">{loadError}</FormMessage>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        ) : !saved ? (
          <div role="status" aria-label="Loading the delivery fees" className="grid gap-3">
            <div className="grid gap-4 sm:grid-cols-3">
              {FIELDS.map((f) => (
                <Skeleton key={f.key} className="h-16 w-full" />
              ))}
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <form onSubmit={save} noValidate className="grid gap-4">
            <div className="grid items-start gap-4 sm:grid-cols-3">
              {FIELDS.map((f) => (
                <FormField key={f.key} id={`shipping-${f.key}`} label={f.label} hint={f.hint} error={errors[f.key]}>
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    className="tabular-nums"
                    value={form[f.key]}
                    onChange={(e) => change(f.key, e.target.value)}
                    disabled={saving}
                  />
                </FormField>
              ))}
            </div>

            {/* The region stays mounted so screen readers hear each new example. */}
            <div aria-live="polite">
              {fees ? (
                <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                  <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {shippingExample(fees)}
                </p>
              ) : null}
            </div>

            {apiError ? <FormMessage variant="error">{apiError}</FormMessage> : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" loading={saving} disabled={!canSave}>
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={() => show(saved)} disabled={!edited || saving}>
                <RotateCcw aria-hidden="true" />
                Reset
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {saved.updatedBy && saved.updatedAt ? (
                <>
                  Last changed by {saved.updatedBy.name} · <LocalTime value={saved.updatedAt} mode="datetime" />
                </>
              ) : (
                "Not changed yet (default)"
              )}
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
