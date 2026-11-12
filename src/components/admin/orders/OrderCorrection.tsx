"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT } from "@/lib/format";
import type { CorrectionAction, CorrectionReason, OrderCorrection as Correction, OrderDetail } from "@/types/commerce";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const ACTIONS: Record<CorrectionAction, string> = {
  DELIVERED: "Mark delivered",
  RETURN_REQUESTED: "Mark return requested",
};

const REASONS: Record<CorrectionReason, string> = {
  DELIVERY_MAN_CONFIRMED_BY_PHONE: "Delivery man confirmed by phone",
  CUSTOMER_CONFIRMED: "Customer confirmed",
  DELIVERY_MAN_UNAVAILABLE: "Delivery man unavailable",
  OTHER: "Other",
};

const NOTE_MIN = 10;
const NOTE_MAX = 500;

/**
 * Admin-only correction for an order stuck Out for delivery (FE-29 / BE-29):
 * `POST /admin/orders/:id/correction`. Logged, and shown in the timeline as a
 * correction by this admin. Kept apart from the normal status buttons.
 */
export function OrderCorrection({ order, onDone }: { order: OrderDetail; onDone: (order: OrderDetail) => void }) {
  const [action, setAction] = useState<CorrectionAction>("DELIVERED");
  const [reason, setReason] = useState<CorrectionReason | "">("");
  const [note, setNote] = useState("");
  const [cash, setCash] = useState<"yes" | "no" | "">("");
  const [errors, setErrors] = useState<{ reason?: string; note?: string; cash?: string }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const needsCash = action === "DELIVERED" && order.paymentMethod === "COD" && order.paymentStatus !== "PAID";

  const review = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!reason) next.reason = "Choose a reason.";
    if (note.trim().length < NOTE_MIN) next.note = `Explain what happened (at least ${NOTE_MIN} characters).`;
    if (needsCash && !cash) next.cash = "Say whether the cash was collected.";
    setErrors(next);
    if (Object.keys(next).length === 0) setConfirmOpen(true);
  };

  const apply = async () => {
    if (!reason) return;
    setSaving(true);
    const body: Correction = { action, reason, note: note.trim(), ...(needsCash ? { cashCollected: cash === "yes" } : {}) };
    try {
      const res = await api.post<OrderDetail>(`/admin/orders/${order.id}/correction`, body);
      toast.success("Correction saved. It is in the order's timeline.");
      setConfirmOpen(false);
      setNote("");
      setReason("");
      setCash("");
      onDone(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the correction."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-6 border-dashed border-warning">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldAlert aria-hidden="true" className="size-5 text-warning" />
          Correction (admin only)
        </CardTitle>
        <CardDescription>Use only when the delivery man can&apos;t update this order.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={review} className="grid gap-4" noValidate>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Action</legend>
            <RadioGroup value={action} onValueChange={(v) => setAction(v as CorrectionAction)} className="flex flex-wrap gap-6">
              {(Object.keys(ACTIONS) as CorrectionAction[]).map((a) => (
                <div key={a} className="flex items-center gap-2">
                  <RadioGroupItem value={a} id={`correction-${a}`} />
                  <Label htmlFor={`correction-${a}`} className="font-normal">
                    {ACTIONS[a]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="grid gap-2">
            <Label htmlFor="correction-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Select value={reason} onValueChange={(v) => setReason(v as CorrectionReason)}>
              <SelectTrigger
                id="correction-reason"
                className="w-full sm:w-80"
                aria-invalid={errors.reason ? true : undefined}
                aria-describedby={errors.reason ? "correction-reason-error" : undefined}
              >
                <SelectValue placeholder="Choose a reason" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(REASONS) as CorrectionReason[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {REASONS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason ? (
              <p id="correction-reason-error" role="alert" className="text-sm text-destructive">
                {errors.reason}
              </p>
            ) : null}
          </div>

          <FormField
            id="correction-note"
            label="Note"
            required
            error={errors.note}
            hint={`What happened? ${NOTE_MIN}–${NOTE_MAX} characters, shown in the timeline.`}
          >
            <Textarea rows={3} maxLength={NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>

          {needsCash ? (
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">
                Cash collected ({formatBDT(order.total)}) <span className="text-destructive">*</span>
              </legend>
              <RadioGroup
                value={cash}
                onValueChange={(v) => setCash(v as "yes" | "no")}
                className="flex gap-6"
                aria-describedby={errors.cash ? "correction-cash-error" : undefined}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="correction-cash-yes" />
                  <Label htmlFor="correction-cash-yes" className="font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="correction-cash-no" />
                  <Label htmlFor="correction-cash-no" className="font-normal">
                    No, still unpaid
                  </Label>
                </div>
              </RadioGroup>
              {errors.cash ? (
                <p id="correction-cash-error" role="alert" className="text-sm text-destructive">
                  {errors.cash}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          <div>
            <Button type="submit" variant="outline" className="border-warning">
              <ShieldAlert aria-hidden="true" />
              Apply correction…
            </Button>
          </div>
        </form>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => !saving && setConfirmOpen(open)}
        title={`${ACTIONS[action]}?`}
        description={
          <>
            This is logged as your correction ({reason ? REASONS[reason] : ""}) and shown in the timeline. The delivery man gets an
            e-mail{action === "DELIVERED" && needsCash ? (cash === "yes" ? "; the cash counts as collected by the delivery man." : "; the order stays unpaid.") : "."}
          </>
        }
        confirmLabel={ACTIONS[action]}
        loading={saving}
        onConfirm={apply}
      />
    </Card>
  );
}
