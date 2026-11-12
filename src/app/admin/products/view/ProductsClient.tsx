"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { productHref } from "@/lib/catalog-url";
import { getErrorMessage } from "@/lib/errors";
import type { AdminProductRow, Paginated } from "@/types/commerce";
import { useDebounce } from "@/hooks/useDebounce";
import { useCategoryTree } from "@/hooks/useCategoryTree";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { StockBadge } from "@/components/admin/StockBadge";
import { PageShell } from "@/components/shared/PageShell";
import { PriceTag } from "@/components/shop/PriceTag";
import { ProductImage } from "@/components/shop/ProductImage";
import { FormMessage } from "@/components/forms/FormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 15;

type StatusFilter = "all" | "active" | "inactive";
type StockFilter = "any" | "low" | "out";

export default function ProductsClient() {
  const { flat } = useCategoryTree();
  const [q, setQ] = useState("");
  const query = useDebounce(q.trim(), 300);
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [stock, setStock] = useState<StockFilter>("any");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<AdminProductRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AdminProductRow | null>(null);
  const [busy, setBusy] = useState(false);

  const categorySlug = flat.find((c) => c.id === category)?.slug;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get<Paginated<AdminProductRow>>("/admin/products", {
        params: {
          page,
          pageSize: PAGE_SIZE,
          q: query || undefined,
          category: categorySlug,
          status,
          stock: stock === "any" ? undefined : stock,
        },
      })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(getErrorMessage(err, "Could not load products."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, query, categorySlug, status, stock, reloadKey]);

  // Any filter change goes back to page 1.
  const filter =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  const toggleActive = async (p: AdminProductRow) => {
    setToggling(p.id);
    try {
      await api.patch(`/admin/products/${p.id}`, { isActive: !p.isActive });
      toast.success(p.isActive ? `${p.name} is now hidden from the shop.` : `${p.name} is now live in the shop.`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    } finally {
      setToggling(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const res = await api.delete<{ success: true; softDeleted: boolean }>(`/admin/products/${deleting.id}`);
      toast.success(
        res.data.softDeleted
          ? `${deleting.name} has orders, so it was hidden instead of deleted.`
          : `${deleting.name} deleted.`
      );
      setDeleting(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the product."));
    } finally {
      setBusy(false);
    }
  };

  const columns: DataTableColumn<AdminProductRow>[] = [
    {
      key: "image",
      header: <span className="sr-only">Image</span>,
      className: "w-14",
      cell: (p) => (
        <span className="relative block size-11 overflow-hidden rounded-md border">
          <ProductImage src={p.mainImage} alt="" sizes="44px" />
        </span>
      ),
    },
    {
      key: "name",
      header: "Product",
      className: "min-w-52",
      cell: (p) => (
        <div className="grid gap-0.5">
          <Link href={`/admin/products/${p.id}/edit`} className="font-medium text-link hover:underline">
            {p.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {p.brand ? `${p.brand} · ` : ""}
            {p.variantCount} {p.variantCount === 1 ? "variant" : "variants"}
          </span>
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (p) => p.category.name },
    {
      key: "price",
      header: "Price",
      cell: (p) => <PriceTag price={p.price} effectivePrice={p.effectivePrice} size="sm" showBadge={false} />,
    },
    { key: "stock", header: "Stock", align: "right", cell: (p) => <StockBadge stock={p.totalStock} /> },
    {
      key: "status",
      header: "Status",
      cell: (p) =>
        p.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Hidden</Badge>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.name}`}>
              <Pencil aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleActive(p)}
            disabled={toggling === p.id}
            aria-label={p.isActive ? `Hide ${p.name} from the shop` : `Show ${p.name} in the shop`}
            title={p.isActive ? "Hide from shop" : "Show in shop"}
          >
            {p.isActive ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </Button>
          {p.isActive ? (
            <Button asChild variant="ghost" size="icon-sm">
              <Link href={productHref(p.slug)} target="_blank" aria-label={`Open ${p.name} in the shop (new tab)`} title="Open in shop">
                <Search aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setDeleting(p)}
            aria-label={`Delete ${p.name}`}
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
      title="Products"
      description="Everything in the shop catalogue, including hidden products."
      actions={
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus aria-hidden="true" />
            New product
          </Link>
        </Button>
      }
    >
      <section aria-label="Filters" className="mb-6 grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor="product-search">Search</Label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="product-search"
              type="search"
              value={q}
              onChange={(e) => filter(setQ)(e.target.value)}
              placeholder="Name, brand or SKU"
              className="pl-8"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="product-category">Category</Label>
          <CategorySelect id="product-category" categories={flat} value={category} onChange={filter(setCategory)} noneLabel="All categories" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="product-status">Status</Label>
          <Select value={status} onValueChange={(v) => filter(setStatus)(v as StatusFilter)}>
            <SelectTrigger id="product-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="product-stock">Stock</Label>
          <Select value={stock} onValueChange={(v) => filter(setStock)(v as StockFilter)}>
            <SelectTrigger id="product-stock" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any stock</SelectItem>
              <SelectItem value="low">Low stock</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {error ? <FormMessage variant="error" className="mb-4">{error}</FormMessage> : null}
      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        {loading ? "Loading…" : data ? `${data.total} ${data.total === 1 ? "product" : "products"}` : ""}
      </p>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(p) => p.id}
        loading={loading}
        loadingLabel="Loading products"
        emptyMessage="No products match these filters."
        caption="Products"
      />
      {data && data.totalPages > 1 ? (
        <PaginationControls className="mt-6" page={page} totalPages={data.totalPages} onPageChange={setPage} />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && !busy && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "product"}?`}
        description="Products that were already ordered can't be removed: they are hidden from the shop instead, so order history stays intact. Otherwise the product, its images and variants are deleted."
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
      />
    </PageShell>
  );
}
