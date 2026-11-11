"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { ArrowLeft, ExternalLink, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { productHref } from "@/lib/catalog-url";
import { getErrorMessage } from "@/lib/errors";
import type { ProductDetail } from "@/types/commerce";
import { useCategoryTree } from "@/hooks/useCategoryTree";
import { ImageManager } from "@/components/admin/products/ImageManager";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { variantToRow, VariantEditor, type VariantRow } from "@/components/admin/products/VariantEditor";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { FormMessage } from "@/components/forms/FormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProductClient({ id, created }: { id: string; created: boolean }) {
  const router = useRouter();
  const { flat } = useCategoryTree();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notFound" | "error">("loading");
  const [error, setError] = useState("");
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const apply = (p: ProductDetail) => {
    setProduct(p);
    setVariants(p.variants.map((v) => variantToRow(v, p.price)));
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get<ProductDetail>(`/admin/products/${encodeURIComponent(id)}`)
      .then((res) => {
        if (cancelled) return;
        apply(res.data);
        setState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status === 404 || status === 400) setState("notFound");
        else {
          setError(getErrorMessage(err, "Could not load the product."));
          setState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleActive = async () => {
    if (!product) return;
    setToggling(true);
    try {
      const res = await api.patch<ProductDetail>(`/admin/products/${product.id}`, { isActive: !product.isActive });
      apply(res.data);
      setFormKey((k) => k + 1);
      toast.success(res.data.isActive ? "The product is now live in the shop." : "The product is now hidden.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    } finally {
      setToggling(false);
    }
  };

  const remove = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      const res = await api.delete<{ success: true; softDeleted: boolean }>(`/admin/products/${product.id}`);
      toast.success(res.data.softDeleted ? "It has orders, so it was hidden instead of deleted." : "Product deleted.");
      router.push("/admin/products/view");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the product."));
      setDeleting(false);
    }
  };

  const back = (
    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 self-start">
      <Link href="/admin/products/view">
        <ArrowLeft aria-hidden="true" />
        Products
      </Link>
    </Button>
  );

  if (state === "loading") {
    return (
      <PageShell width="lg">
        {back}
        <div role="status" aria-label="Loading product" className="grid gap-6">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </PageShell>
    );
  }
  if (state !== "ready" || !product) {
    return (
      <PageShell width="md">
        {back}
        <FormMessage variant="error" title={state === "notFound" ? "Product not found" : "Something went wrong"}>
          {state === "notFound" ? "It may have been deleted." : error}
        </FormMessage>
      </PageShell>
    );
  }

  const unsaved = variants.some((v) => v.dirty);

  return (
    <PageShell width="lg">
      {back}
      {created ? (
        <FormMessage variant="success" title="Product created" className="mb-6">
          Add photos below, then tick “Visible in the shop” (or use Show in shop) when it&apos;s ready.
        </FormMessage>
      ) : null}

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {product.isActive ? <Badge variant="success">Visible</Badge> : <Badge variant="secondary">Hidden</Badge>}
            <span>
              Updated <LocalTime value={product.updatedAt} mode="datetime" />
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={toggleActive} loading={toggling}>
            {toggling ? null : product.isActive ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            {product.isActive ? "Hide from shop" : "Show in shop"}
          </Button>
          {product.isActive ? (
            <Button asChild variant="outline">
              <Link href={productHref(product.slug)} target="_blank">
                <ExternalLink aria-hidden="true" />
                View<span className="sr-only"> in the shop (opens in a new tab)</span>
              </Link>
            </Button>
          ) : null}
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Photos</CardTitle>
            <CardDescription>The main photo is used on product cards and in search results.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageManager
              productId={product.id}
              images={product.images}
              onChange={(images) => setProduct((p) => (p ? { ...p, images } : p))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variants and stock</CardTitle>
            <CardDescription>
              Each row saves on its own.{" "}
              {unsaved ? <span className="font-medium text-warning">You have unsaved rows.</span> : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VariantEditor rows={variants} onRowsChange={setVariants} productId={product.id} productPrice={product.price} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              key={formKey}
              product={product}
              categories={flat}
              submitLabel="Save details"
              onSubmit={async (body) => {
                try {
                  const res = await api.patch<ProductDetail>(`/admin/products/${product.id}`, body);
                  setProduct(res.data);
                  setFormKey((k) => k + 1);
                  toast.success("Details saved.");
                } catch (err) {
                  throw new Error(getErrorMessage(err, "Could not save the details."));
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(o) => !deleting && setDeleteOpen(o)}
        title={`Delete ${product.name}?`}
        description="If it was ever ordered, it is hidden instead so order history stays intact. Otherwise it is deleted with its photos and variants."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={remove}
      />
    </PageShell>
  );
}
