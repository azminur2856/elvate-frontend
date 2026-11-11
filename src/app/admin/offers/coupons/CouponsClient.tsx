"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { couponHeadline } from "@/lib/coupons";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT, fromDateTimeLocal, toDateTimeLocal } from "@/lib/format";
import type { Coupon, CouponInput, Paginated } from "@/types/commerce";
import { useDebounce } from "@/hooks/useDebounce";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 15;
type StatusFilter = "all" | "active" | "expired" | "inactive";

/** Where a coupon stands right now. */
export function couponState(c: Pick<Coupon, "isActive" | "startsAt" | "expiresAt" | "usageLimit" | "usedCount">) {
  const now = Date.now();
  if (!c.isActive) return { label: "Off", variant: "secondary" as const };
  if (new Date(c.expiresAt).getTime() < now) return { label: "Expired", variant: "outline" as const };
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return { label: "Used up", variant: "outline" as const };
  if (new Date(c.startsAt).getTime() > now) return { label: "Scheduled", variant: "warning" as const };
  return { label: "Live", variant: "success" as const };
}

const num = (v: string) => (v.trim() === "" ? null : Number(v));

function CouponDialog({ coupon, onClose, onSaved }: { coupon: Coupon | null; onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [description, setDescription] = useState(coupon?.description ?? "");
  const [type, setType] = useState<Coupon["type"]>(coupon?.type ?? "PERCENT");
  const [value, setValue] = useState(coupon ? String(coupon.value) : "");
  const [minOrder, setMinOrder] = useState(coupon?.minOrderAmount != null ? String(coupon.minOrderAmount) : "");
  const [maxDiscount, setMaxDiscount] = useState(coupon?.maxDiscount != null ? String(coupon.maxDiscount) : "");
  const [startsAt, setStartsAt] = useState(toDateTimeLocal(coupon?.startsAt ?? new Date().toISOString()));
  const [expiresAt, setExpiresAt] = useState(toDateTimeLocal(coupon?.expiresAt));
  const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit != null ? String(coupon.usageLimit) : "");
  const [perUserLimit, setPerUserLimit] = useState(coupon?.perUserLimit != null ? String(coupon.perUserLimit) : "1");
  const [isPublic, setPublic] = useState(coupon?.isPublic ?? true);
  const [isActive, setActive] = useState(coupon?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const c = code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,30}$/.test(c)) next.code = "3–30 letters, numbers, dashes or underscores.";
    const v = Number(value);
    if (!(v > 0)) next.value = "Enter a value above 0.";
    else if (type === "PERCENT" && v > 100) next.value = "A percentage can't be more than 100.";
    for (const [key, raw] of [["minOrder", minOrder], ["maxDiscount", maxDiscount], ["usageLimit", usageLimit], ["perUserLimit", perUserLimit]] as const) {
      if (raw.trim() && !(Number(raw) > 0)) next[key] = "Leave empty or enter a number above 0.";
    }
    const start = fromDateTimeLocal(startsAt);
    const end = fromDateTimeLocal(expiresAt);
    if (!start) next.startsAt = "Choose a start date.";
    if (!end) next.expiresAt = "Choose an end date.";
    else if (start && end <= start) next.expiresAt = "The end must be after the start.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const body: CouponInput = {
      code: c,
      description: description.trim() || null,
      type,
      value: v,
      minOrderAmount: num(minOrder),
      maxDiscount: type === "PERCENT" ? num(maxDiscount) : null,
      startsAt: start as string,
      expiresAt: end as string,
      usageLimit: num(usageLimit),
      perUserLimit: num(perUserLimit),
      isPublic,
      isActive,
    };
    setSaving(true);
    setFormError("");
    try {
      if (coupon) await api.patch(`/admin/coupons/${coupon.id}`, body);
      else await api.post("/admin/coupons", body);
      toast.success(coupon ? "Coupon updated." : "Coupon created.");
      onSaved();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not save the coupon."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{coupon ? `Edit ${coupon.code}` : "New coupon"}</DialogTitle>
          <DialogDescription>Discounts apply to the subtotal, not to delivery.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          {formError ? <FormMessage variant="error">{formError}</FormMessage> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="coupon-code" label="Code" error={errors.code} required hint="Customers type this at checkout.">
              <Input value={code} maxLength={30} className="font-mono uppercase" onChange={(e) => setCode(e.target.value.toUpperCase())} />
            </FormField>
            <FormField id="coupon-description" label="Description" hint="Shown on the Offers page for public codes.">
              <Input value={description} maxLength={120} onChange={(e) => setDescription(e.target.value)} />
            </FormField>
          </div>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Discount type</legend>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  ["PERCENT", "Percentage (%)"],
                  ["FIXED", "Fixed amount (৳)"],
                ] as const
              ).map(([t, label]) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="coupon-type" value={t} checked={type === t} onChange={() => setType(t)} className="size-4 accent-primary" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="coupon-value" label={type === "PERCENT" ? "Percent off" : "Amount off (৳)"} error={errors.value} required>
              <Input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
            </FormField>
            <FormField id="coupon-min" label="Minimum order (৳)" error={errors.minOrder}>
              <Input inputMode="decimal" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
            </FormField>
            {type === "PERCENT" ? (
              <FormField id="coupon-max" label="Max discount (৳)" error={errors.maxDiscount}>
                <Input inputMode="decimal" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
              </FormField>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="coupon-start" label="Starts" error={errors.startsAt} required>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </FormField>
            <FormField id="coupon-end" label="Expires" error={errors.expiresAt} required>
              <Input type="datetime-local" value={expiresAt} min={startsAt || undefined} onChange={(e) => setExpiresAt(e.target.value)} />
            </FormField>
            <FormField id="coupon-limit" label="Total uses" error={errors.usageLimit} hint="Empty = unlimited">
              <Input inputMode="numeric" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
            </FormField>
            <FormField id="coupon-per-user" label="Uses per customer" error={errors.perUserLimit} hint="Empty = unlimited">
              <Input inputMode="numeric" value={perUserLimit} onChange={(e) => setPerUserLimit(e.target.value)} />
            </FormField>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <Checkbox id="coupon-public" checked={isPublic} onCheckedChange={(c) => setPublic(c === true)} />
              <Label htmlFor="coupon-public">Show on the Offers page</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="coupon-active" checked={isActive} onCheckedChange={(c) => setActive(c === true)} />
              <Label htmlFor="coupon-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {coupon ? "Save changes" : "Create coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CouponsClient() {
  const [q, setQ] = useState("");
  const query = useDebounce(q.trim(), 300);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Coupon> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<Coupon | "new" | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get<Paginated<Coupon>>("/admin/coupons", {
        params: { page, pageSize: PAGE_SIZE, q: query || undefined, status: status === "all" ? undefined : status },
      })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(getErrorMessage(err, "Could not load coupons."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, query, status, reloadKey]);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/admin/coupons/${deleting.id}`);
      toast.success(
        deleting.usedCount > 0 ? `${deleting.code} was used before, so it was switched off.` : `${deleting.code} deleted.`
      );
      setDeleting(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the coupon."));
    } finally {
      setBusy(false);
    }
  };

  const columns: DataTableColumn<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      cell: (c) => (
        <div className="grid gap-0.5">
          <span className="font-mono font-semibold">{c.code}</span>
          {c.description ? <span className="text-xs text-muted-foreground">{c.description}</span> : null}
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      cell: (c) => (
        <div className="grid gap-0.5">
          <span className="font-medium">{couponHeadline(c)}</span>
          <span className="text-xs text-muted-foreground">
            {[
              c.minOrderAmount ? `min ${formatBDT(c.minOrderAmount)}` : null,
              c.type === "PERCENT" && c.maxDiscount ? `max ${formatBDT(c.maxDiscount)}` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "No minimum"}
          </span>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Valid",
      cell: (c) => (
        <span className="whitespace-nowrap text-sm">
          <LocalTime value={c.startsAt} /> – <LocalTime value={c.expiresAt} />
        </span>
      ),
    },
    {
      key: "usage",
      header: "Used",
      align: "right",
      cell: (c) => (
        <span className="tabular-nums">
          {c.usedCount}
          {c.usageLimit !== null ? ` / ${c.usageLimit}` : ""}
        </span>
      ),
    },
    {
      key: "state",
      header: "Status",
      cell: (c) => {
        const s = couponState(c);
        return (
          <div className="flex flex-wrap gap-1">
            <Badge variant={s.variant}>{s.label}</Badge>
            {c.isPublic ? <Badge variant="outline">Public</Badge> : null}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(c)} aria-label={`Edit ${c.code}`}>
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setDeleting(c)}
            aria-label={`Delete ${c.code}`}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      width="xl"
      title="Coupons"
      description="Codes customers enter at checkout. Public codes are listed on the Offers page."
      actions={
        <Button onClick={() => setEditing("new")}>
          <Plus aria-hidden="true" />
          New coupon
        </Button>
      }
    >
      <section aria-label="Filters" className="mb-6 grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_14rem]">
        <div className="grid gap-1.5">
          <Label htmlFor="coupon-search">Search</Label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="coupon-search"
              type="search"
              className="pl-8"
              placeholder="Code or description"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="coupon-status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger id="coupon-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="inactive">Switched off</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {error ? <FormMessage variant="error" className="mb-4">{error}</FormMessage> : null}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(c) => c.id}
        loading={loading}
        loadingLabel="Loading coupons"
        emptyMessage="No coupons yet."
        caption="Coupons"
      />
      {data && data.totalPages > 1 ? (
        <PaginationControls className="mt-6" page={page} totalPages={data.totalPages} onPageChange={setPage} />
      ) : null}

      {editing ? (
        <CouponDialog
          key={editing === "new" ? "new" : editing.id}
          coupon={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setReloadKey((k) => k + 1);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && !busy && setDeleting(null)}
        title={`Delete ${deleting?.code ?? "coupon"}?`}
        description="Coupons that were already used are switched off instead of deleted, so past orders keep their discount."
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
      />
    </PageShell>
  );
}
