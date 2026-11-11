"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { AdminProductDetail } from "@/types/commerce";
import { useCategoryTree } from "@/hooks/useCategoryTree";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { newVariantRow, rowError, rowToInput, VariantEditor, type VariantRow } from "@/components/admin/products/VariantEditor";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";

/** Create a product with its first variants; images are added on the edit page. */
export default function NewProductClient() {
  const router = useRouter();
  const { flat } = useCategoryTree();
  const [variants, setVariants] = useState<VariantRow[]>([newVariantRow()]);

  return (
    <PageShell width="lg">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 self-start">
        <Link href="/admin/products/view">
          <ArrowLeft aria-hidden="true" />
          Products
        </Link>
      </Button>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New product</h1>
        <p className="mt-1 text-muted-foreground">Add the details and variants first. You can upload photos right after.</p>
      </header>
      <ProductForm
        categories={flat}
        submitLabel="Create product"
        validateExtra={() => {
          if (!variants.length) return "Add at least one variant.";
          const bad = variants.find((r) => rowError(r));
          return bad ? `Variant ${variants.indexOf(bad) + 1}: ${rowError(bad)}` : null;
        }}
        onSubmit={async (body) => {
          try {
            const res = await api.post<AdminProductDetail>("/admin/products", {
              ...body,
              variants: variants.map(rowToInput),
            });
            toast.success("Product created. Add photos next.");
            router.replace(`/admin/products/${res.data.id}/edit?created=1`);
          } catch (err) {
            throw new Error(getErrorMessage(err, "Could not create the product."));
          }
        }}
      >
        <section aria-labelledby="variants-heading" className="grid gap-3">
          <div>
            <h2 id="variants-heading" className="text-lg font-semibold">
              Variants
            </h2>
            <p className="text-sm text-muted-foreground">
              One row per size / colour combination. Leave the price empty to use the product price.
            </p>
          </div>
          <VariantEditor rows={variants} onRowsChange={setVariants} />
        </section>
      </ProductForm>
    </PageShell>
  );
}
