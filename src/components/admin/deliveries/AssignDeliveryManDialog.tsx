"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { DeliveryManOption, OrderDetail } from "@/types/commerce";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AssignTarget = { id: string; orderNumber: string; deliveryMan?: { id: string; name: string } | null };

/**
 * Assign or reassign a delivery man (`PATCH /admin/orders/:id/assign`), only
 * while the order is PROCESSING or SHIPPED. Shows each man's current load.
 */
export function AssignDeliveryManDialog({
  order,
  onClose,
  onAssigned,
}: {
  order: AssignTarget | null;
  onClose: () => void;
  onAssigned: (order: OrderDetail) => void;
}) {
  const [men, setMen] = useState<DeliveryManOption[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [choice, setChoice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    setChoice(order.deliveryMan?.id ?? "");
    setMen(null);
    setLoadError("");
    api
      .get<DeliveryManOption[]>("/admin/orders/delivery-men")
      .then((res) => setMen(res.data))
      .catch((err) => setLoadError(getErrorMessage(err, "Could not load the delivery men.")));
  }, [order]);

  const reassign = Boolean(order?.deliveryMan);
  const unchanged = choice === (order?.deliveryMan?.id ?? "");

  const save = async () => {
    if (!order || !choice || unchanged) return;
    setSaving(true);
    try {
      const res = await api.patch<OrderDetail>(`/admin/orders/${order.id}/assign`, { deliveryManId: choice });
      toast.success(`${order.orderNumber} is assigned to ${res.data.deliveryMan?.name ?? "the delivery man"}.`);
      onAssigned(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not assign the delivery man."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={order !== null} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{reassign ? "Reassign delivery man" : "Assign a delivery man"}</DialogTitle>
          <DialogDescription>
            {order ? (
              reassign ? (
                <>
                  <span className="font-mono">{order.orderNumber}</span> is with {order.deliveryMan?.name}. Choose someone else
                  to take it over.
                </>
              ) : (
                <>
                  Who delivers <span className="font-mono">{order.orderNumber}</span>?
                </>
              )
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {loadError ? (
          <FormMessage variant="error">{loadError}</FormMessage>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="assign-delivery-man">Delivery man</Label>
            <Select value={choice} onValueChange={setChoice} disabled={!men}>
              <SelectTrigger id="assign-delivery-man" className="w-full">
                <SelectValue placeholder={men ? "Choose a delivery man" : "Loading…"} />
              </SelectTrigger>
              <SelectContent>
                {(men ?? []).map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} · {d.activeOrders} active
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {men && men.length === 0 ? (
              <p className="text-sm text-muted-foreground">There are no active delivery men.</p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!choice || unchanged || Boolean(loadError)}>
            {reassign ? "Reassign" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
