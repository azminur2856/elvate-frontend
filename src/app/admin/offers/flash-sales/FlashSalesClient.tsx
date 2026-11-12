"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { formatBDT, fromDateTimeLocal, toDateTimeLocal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminProductRow, FlashSale, FlashSaleInput, Paginated, ProductCard } from "@/types/commerce";
import { useDebounce } from "@/hooks/useDebounce";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { ProductImage } from "@/components/shop/ProductImage";
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
import { Spinner } from "@/components/ui/spinner";

const PAGE_SIZE = 15;
type Tab = "all" | "live" | "scheduled" | "ended";
type PickedProduct = Pick<ProductCard, "id" | "name" | "price" | "mainImage">;

function saleState(s: FlashSale) {
  const now = Date.now();
  if (new Date(s.endsAt).getTime() < now) return { label: "Ended", variant: "outline" as const };
  if (!s.isActive) return { label: "Off", variant: "secondary" as const };
  if (new Date(s.startsAt).getTime() > now) return { label: "Scheduled", variant: "warning" as const };
  return { label: "Live", variant: "success" as const };
}

/** Search the catalogue (`/admin/products?q=`) and pick one product. */
function ProductPicker({ value, onChange, error }: { value: PickedProduct | null; onChange: (p: PickedProduct | null) => void; error?: string }) {
  const [q, setQ] = useState("");
  const query = useDebounce(q.trim(), 300);
  const [rows, setRows] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<Paginated<AdminProductRow>>("/admin/products", { params: { q: query || undefined, pageSize: 6, status: "active" } })
      .then((res) => !cancelled && setRows(res.data.items))
      .catch(() => !cancelled && setRows([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query, value]);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-2">
        <span className="relative size-10 shrink-0 overflow-hidden rounded-md border">
          <ProductImage src={value.mainImage} alt="" sizes="40px" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{value.name}</p>
          <p className="text-xs text-muted-foreground">Regular price {formatBDT(value.price)}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)} aria-label={`Choose another product instead of ${value.name}`}>
          <X aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search products"
          aria-invalid={error ? true : undefined}
          placeholder="Search active products"
          className="pl-8"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="max-h-56 overflow-y-auto rounded-lg border" aria-busy={loading}>
        {loading ? (
          <div className="flex justify-center p-4">
            <Spinner size="sm" label="Searching products" />
          </div>
        ) : rows.length ? (
          <ul>
            {rows.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onChange({ id: p.id, name: p.name, price: p.price, mainImage: p.mainImage })}
                  className="flex w-full items-center gap-3 px-2 py-2 text-left text-sm hover:bg-accent"
                >
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-md border">
                    <ProductImage src={p.mainImage} alt="" sizes="36px" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{formatBDT(p.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">No products found.</p>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FlashSaleDialog({ sale, onClose, onSaved }: { sale: FlashSale | null; onClose: () => void; onSaved: () => void }) {
  const [product, setProduct] = useState<PickedProduct | null>(sale ? sale.product : null);
  const [title, setTitle] = useState(sale?.title ?? "");
  const [percent, setPercent] = useState(sale ? String(sale.discountPercent) : "20");
  const [startsAt, setStartsAt] = useState(toDateTimeLocal(sale?.startsAt ?? new Date().toISOString()));
  const [endsAt, setEndsAt] = useState(toDateTimeLocal(sale?.endsAt));
  const [isActive, setActive] = useState(sale?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const pct = Number(percent);
  const preview = product && pct >= 1 && pct <= 90 ? Math.round(product.price * (1 - pct / 100)) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!product) next.product = "Choose a product.";
    if (!Number.isInteger(pct) || pct < 1 || pct > 90) next.percent = "Use a whole number from 1 to 90.";
    const start = fromDateTimeLocal(startsAt);
    const end = fromDateTimeLocal(endsAt);
    if (!start) next.startsAt = "Choose a start.";
    if (!end) next.endsAt = "Choose an end.";
    else if (start && end <= start) next.endsAt = "The end must be after the start.";
    setErrors(next);
    if (Object.keys(next).length || !product) return;

    const body: FlashSaleInput = {
      productId: product.id,
      title: title.trim() || undefined,
      discountPercent: pct,
      startsAt: start as string,
      endsAt: end as string,
      isActive,
    };
    setSaving(true);
    setFormError("");
    try {
      if (sale) await api.patch(`/admin/flash-sales/${sale.id}`, body);
      else await api.post("/admin/flash-sales", body);
      toast.success(sale ? "Flash sale updated." : "Flash sale created.");
      onSaved();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not save the flash sale."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{sale ? "Edit flash sale" : "New flash sale"}</DialogTitle>
          <DialogDescription>A product can only have one flash sale at a time.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          {formError ? <FormMessage variant="error">{formError}</FormMessage> : null}
          <div className="grid gap-1.5">
            <span className="text-sm font-medium">
              Product<span aria-hidden="true" className="text-destructive"> *</span>
            </span>
            <ProductPicker
              value={product}
              onChange={(p) => {
                setProduct(p);
                setErrors((e) => ({ ...e, product: "" }));
              }}
              error={errors.product || undefined}
            />
          </div>
          <FormField id="sale-title" label="Title" hint="Optional, e.g. Eid flash sale">
            <Input value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField
            id="sale-percent"
            label="Discount (%)"
            error={errors.percent}
            required
            hint={preview !== null ? `Sale price about ${formatBDT(preview)}` : "1 to 90"}
          >
            <Input inputMode="numeric" value={percent} onChange={(e) => setPercent(e.target.value)} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="sale-start" label="Starts" error={errors.startsAt} required>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </FormField>
            <FormField id="sale-end" label="Ends" error={errors.endsAt} required>
              <Input type="datetime-local" value={endsAt} min={startsAt || undefined} onChange={(e) => setEndsAt(e.target.value)} />
            </FormField>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="sale-active" checked={isActive} onCheckedChange={(c) => setActive(c === true)} />
            <Label htmlFor="sale-active">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {sale ? "Save changes" : "Create flash sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FlashSalesClient() {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<FlashSale> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<FlashSale | "new" | null>(null);
  const [deleting, setDeleting] = useState<FlashSale | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get<Paginated<FlashSale>>("/admin/flash-sales", {
        params: { page, pageSize: PAGE_SIZE, status: tab === "all" ? undefined : tab },
      })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(getErrorMessage(err, "Could not load flash sales."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, tab, reloadKey]);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/admin/flash-sales/${deleting.id}`);
      toast.success("Flash sale deleted.");
      setDeleting(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the flash sale."));
    } finally {
      setBusy(false);
    }
  };

  const columns: DataTableColumn<FlashSale>[] = [
    {
      key: "product",
      header: "Product",
      className: "min-w-52",
      cell: (s) => (
        <span className="flex items-center gap-3">
          <span className="relative size-10 shrink-0 overflow-hidden rounded-md border">
            <ProductImage src={s.product.mainImage} alt="" sizes="40px" />
          </span>
          <span className="grid gap-0.5">
            <span className="font-medium">{s.product.name}</span>
            {s.title ? <span className="text-xs text-muted-foreground">{s.title}</span> : null}
          </span>
        </span>
      ),
    },
    { key: "pct", header: "Discount", align: "right", cell: (s) => <span className="font-semibold tabular-nums">−{s.discountPercent}%</span> },
    {
      key: "when",
      header: "When",
      cell: (s) => (
        <span className="whitespace-nowrap text-sm">
          <LocalTime value={s.startsAt} mode="datetime" /> → <LocalTime value={s.endsAt} mode="datetime" />
        </span>
      ),
    },
    {
      key: "state",
      header: "Status",
      cell: (s) => {
        const st = saleState(s);
        return <Badge variant={st.variant}>{st.label}</Badge>;
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(s)} aria-label={`Edit flash sale for ${s.product.name}`}>
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setDeleting(s)}
            aria-label={`Delete flash sale for ${s.product.name}`}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "live", label: "Live" },
    { key: "scheduled", label: "Scheduled" },
    { key: "ended", label: "Ended" },
  ];

  return (
    <PageShell
      width="xl"
      title="Flash sales"
      description="Time-limited discounts on single products, shown with a countdown in the shop."
      actions={
        <Button onClick={() => setEditing("new")}>
          <Plus aria-hidden="true" />
          New flash sale
        </Button>
      }
    >
      <div role="group" aria-label="Filter by status" className="mb-6 flex w-fit gap-1 rounded-lg border bg-muted/50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? <FormMessage variant="error" className="mb-4">{error}</FormMessage> : null}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(s) => s.id}
        loading={loading}
        loadingLabel="Loading flash sales"
        emptyMessage={tab === "all" ? "No flash sales yet." : "Nothing here."}
        caption="Flash sales"
      />
      {data && data.totalPages > 1 ? (
        <PaginationControls className="mt-6" page={page} totalPages={data.totalPages} onPageChange={setPage} />
      ) : null}

      {editing ? (
        <FlashSaleDialog
          key={editing === "new" ? "new" : editing.id}
          sale={editing === "new" ? null : editing}
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
        title="Delete this flash sale?"
        description={deleting ? `${deleting.product.name} goes back to its normal price.` : undefined}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
      />
    </PageShell>
  );
}
