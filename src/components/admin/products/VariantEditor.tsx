"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT } from "@/lib/format";
import type { ProductVariant, VariantInput } from "@/types/commerce";
import { cn } from "@/lib/utils";
import { StockBadge } from "@/components/admin/StockBadge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";

/** Editable row; strings so inputs can be empty while typing. */
export type VariantRow = {
  key: string;
  id: string | null;
  size: string;
  color: string;
  sku: string;
  stock: string;
  price: string;
  dirty: boolean;
};

let rowSeq = 0;
export const newVariantRow = (): VariantRow => ({
  key: `new-${++rowSeq}`,
  id: null,
  size: "",
  color: "",
  sku: "",
  stock: "0",
  price: "",
  dirty: true,
});

export const variantToRow = (v: ProductVariant, productPrice: number): VariantRow => ({
  key: v.id,
  id: v.id,
  size: v.size ?? "",
  color: v.color ?? "",
  sku: v.sku ?? "",
  stock: String(v.stock),
  // Only show an override when it differs from the product price.
  price: v.price !== productPrice ? String(v.price) : "",
  dirty: false,
});

/** Validation message for a row, or null. */
export function rowError(r: VariantRow): string | null {
  if (!/^\d+$/.test(r.stock.trim())) return "Stock must be a whole number (0 or more).";
  if (r.price.trim() && !(Number(r.price) > 0)) return "Price override must be more than 0.";
  return null;
}

export function rowToInput(r: VariantRow): VariantInput {
  return {
    size: r.size.trim() || undefined,
    color: r.color.trim() || undefined,
    sku: r.sku.trim() || undefined,
    stock: Number(r.stock),
    price: r.price.trim() ? Number(r.price) : undefined,
  };
}

type VariantEditorProps = {
  rows: VariantRow[];
  onRowsChange: (rows: VariantRow[]) => void;
  /** Edit mode: rows are saved one by one against this product. Create mode: omitted. */
  productId?: string;
  productPrice?: number;
};

/**
 * Size / colour / SKU / stock / price-override rows. In create mode the rows
 * are sent with the product; in edit mode each row saves on its own
 * (`POST /admin/products/:id/variants`, `PATCH|DELETE /admin/products/variants/:id`).
 */
export function VariantEditor({ rows, onRowsChange, productId, productPrice }: VariantEditorProps) {
  const live = Boolean(productId);
  const [saving, setSaving] = useState<string | null>(null);
  const [removing, setRemoving] = useState<VariantRow | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: string, patch: Partial<VariantRow>) =>
    onRowsChange(rows.map((r) => (r.key === key ? { ...r, ...patch, dirty: true } : r)));

  const save = async (r: VariantRow) => {
    const problem = rowError(r);
    if (problem) {
      toast.error(problem);
      return;
    }
    setSaving(r.key);
    try {
      const body = rowToInput(r);
      const res = r.id
        ? await api.patch<ProductVariant>(`/admin/products/variants/${r.id}`, {
            ...body,
            // An emptied override goes back to the product price.
            price: r.price.trim() ? Number(r.price) : null,
          })
        : await api.post<ProductVariant>(`/admin/products/${productId}/variants`, body);
      onRowsChange(rows.map((x) => (x.key === r.key ? variantToRow(res.data, productPrice ?? 0) : x)));
      toast.success("Variant saved.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the variant."));
    } finally {
      setSaving(null);
    }
  };

  const remove = async () => {
    if (!removing) return;
    if (!removing.id) {
      onRowsChange(rows.filter((r) => r.key !== removing.key));
      setRemoving(null);
      return;
    }
    setBusy(true);
    try {
      await api.delete(`/admin/products/variants/${removing.id}`);
      onRowsChange(rows.filter((r) => r.key !== removing.key));
      toast.success("Variant removed.");
      setRemoving(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not remove the variant."));
    } finally {
      setBusy(false);
    }
  };

  const label = (r: VariantRow) => [r.size, r.color].filter(Boolean).join(" / ") || "variant";

  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[44rem] text-sm">
          <caption className="sr-only">Variants</caption>
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Size</th>
              <th scope="col" className="px-3 py-2 font-medium">Colour</th>
              <th scope="col" className="px-3 py-2 font-medium">SKU</th>
              <th scope="col" className="w-24 px-3 py-2 font-medium">Stock</th>
              <th scope="col" className="w-32 px-3 py-2 font-medium">
                Price <span className="font-normal">(optional)</span>
              </th>
              <th scope="col" className="px-3 py-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => {
              const problem = r.dirty ? rowError(r) : null;
              return (
                <tr key={r.key} className={cn(r.dirty && live && "bg-warning/5")}>
                  <td className="px-3 py-2">
                    <Input aria-label={`Variant ${i + 1} size`} placeholder="M" value={r.size} maxLength={20} onChange={(e) => set(r.key, { size: e.target.value })} />
                  </td>
                  <td className="px-3 py-2">
                    <Input aria-label={`Variant ${i + 1} colour`} placeholder="Black" value={r.color} maxLength={30} onChange={(e) => set(r.key, { color: e.target.value })} />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      aria-label={`Variant ${i + 1} SKU`}
                      placeholder="Automatic"
                      value={r.sku}
                      maxLength={40}
                      className="font-mono"
                      onChange={(e) => set(r.key, { sku: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      aria-label={`Variant ${i + 1} stock`}
                      inputMode="numeric"
                      value={r.stock}
                      aria-invalid={problem?.startsWith("Stock") || undefined}
                      onChange={(e) => set(r.key, { stock: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      aria-label={`Variant ${i + 1} price override`}
                      inputMode="decimal"
                      placeholder={productPrice ? formatBDT(productPrice) : "Product price"}
                      value={r.price}
                      aria-invalid={problem?.startsWith("Price") || undefined}
                      onChange={(e) => set(r.key, { price: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      {live && !r.dirty ? <StockBadge stock={Number(r.stock)} /> : null}
                      {live && r.dirty ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => save(r)}
                          loading={saving === r.key}
                          aria-label={`Save ${label(r)}`}
                        >
                          {saving === r.key ? null : <Save aria-hidden="true" />}
                          Save
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => (r.id ? setRemoving(r) : onRowsChange(rows.filter((x) => x.key !== r.key)))}
                        disabled={!live && rows.length === 1}
                        aria-label={`Remove ${label(r)}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                    {problem ? <p className="mt-1 text-right text-xs text-destructive">{problem}</p> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => onRowsChange([...rows, newVariantRow()])}>
        <Plus aria-hidden="true" />
        Add variant
      </Button>
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => !o && !busy && setRemoving(null)}
        title={`Remove ${removing ? label(removing) : "variant"}?`}
        description="Customers can no longer buy it. Orders that already contain it are not changed. A product needs at least one variant."
        confirmLabel="Remove"
        destructive
        loading={busy}
        onConfirm={remove}
      />
    </div>
  );
}
