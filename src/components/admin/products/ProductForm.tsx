"use client";

import { useId, useState } from "react";
import type { AdminProductDetail } from "@/types/commerce";
import type { FlatCategory } from "@/hooks/useCategoryTree";
import { formatBDT } from "@/lib/format";
import { slugify, SLUG_RE } from "@/lib/slug";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { rowsToSpecs, SpecsEditor, specsToRows, type SpecRow } from "./SpecsEditor";

/** Body for POST (create) / PATCH (edit) without variants. `null` clears a field on PATCH. */
export type ProductDetailsBody = {
  name: string;
  slug?: string;
  description: string;
  brand?: string | null;
  categoryId: string;
  price: number;
  salePrice?: number | null;
  material?: string | null;
  careInstructions?: string | null;
  specifications: Record<string, string>;
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
};

type Errors = Partial<Record<"name" | "slug" | "description" | "categoryId" | "price" | "salePrice", string>>;

type ProductFormProps = {
  product?: AdminProductDetail | null;
  categories: FlatCategory[];
  /** Throw to show the error at the top of the form. */
  onSubmit: (body: ProductDetailsBody) => Promise<void>;
  submitLabel: string;
  /** Extra content between the fields and the submit button (variant rows on "new"). */
  children?: React.ReactNode;
  /** Extra validation (e.g. variants) — return a message to block submit. */
  validateExtra?: () => string | null;
};

export function ProductForm({ product, categories, onSubmit, submitLabel, children, validateExtra }: ProductFormProps) {
  const id = useId();
  const editing = Boolean(product);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [description, setDescription] = useState(product?.description ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(product?.category.id ?? null);
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [salePrice, setSalePrice] = useState(
    product?.salePrice != null ? String(product.salePrice) : ""
  );
  const [material, setMaterial] = useState(product?.material ?? "");
  const [care, setCare] = useState(product?.careInstructions ?? "");
  const [specs, setSpecs] = useState<SpecRow[]>(specsToRows(product?.specifications));
  const [isFeatured, setFeatured] = useState(product?.isFeatured ?? false);
  const [isNewArrival, setNewArrival] = useState(product?.isNewArrival ?? true);
  const [isActive, setActive] = useState(product?.isActive ?? false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const shownSlug = slugTouched ? slug : slugify(name);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter a product name.";
    if (shownSlug && !SLUG_RE.test(shownSlug)) next.slug = "Use lowercase letters, numbers and single dashes.";
    if (!description.trim()) next.description = "Describe the product.";
    if (!categoryId) next.categoryId = "Choose a category.";
    const p = Number(price);
    if (!(p > 0)) next.price = "Enter a price above 0.";
    if (salePrice.trim()) {
      const s = Number(salePrice);
      if (!(s > 0)) next.salePrice = "Enter a sale price above 0, or leave it empty.";
      else if (p > 0 && s >= p) next.salePrice = "The sale price must be lower than the price.";
    }
    setErrors(next);
    const extra = validateExtra?.() ?? null;
    setFormError(extra ?? "");
    if (Object.keys(next).length || extra) {
      const first = (["name", "slug", "categoryId", "price", "salePrice", "description"] as const).find((k) => next[k]);
      if (first) document.getElementById(`${id}-${first}`)?.focus();
      return;
    }

    const clear = (v: string) => (v.trim() ? v.trim() : editing ? null : undefined);
    const body: ProductDetailsBody = {
      name: name.trim(),
      description: description.trim(),
      brand: clear(brand),
      categoryId: categoryId as string,
      price: p,
      salePrice: salePrice.trim() ? Number(salePrice) : editing ? null : undefined,
      material: clear(material),
      careInstructions: clear(care),
      specifications: rowsToSpecs(specs),
      isFeatured,
      isNewArrival,
      isActive,
    };
    if (shownSlug && shownSlug !== product?.slug) body.slug = shownSlug;

    setSaving(true);
    try {
      await onSubmit(body);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the product.");
    } finally {
      setSaving(false);
    }
  };

  const discount =
    Number(price) > 0 && Number(salePrice) > 0 && Number(salePrice) < Number(price)
      ? Math.round((1 - Number(salePrice) / Number(price)) * 100)
      : 0;

  return (
    <form onSubmit={submit} className="grid gap-6" noValidate>
      {formError ? <FormMessage variant="error">{formError}</FormMessage> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${id}-name`} label="Name" error={errors.name} required>
          <Input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField
          id={`${id}-slug`}
          label="URL slug"
          error={errors.slug}
          hint={editing ? "Changing it changes the product's address in the shop." : "Filled in from the name; edit if you like."}
        >
          <Input
            value={shownSlug}
            className="font-mono"
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
          />
        </FormField>
        <FormField id={`${id}-brand`} label="Brand">
          <Input value={brand} maxLength={60} onChange={(e) => setBrand(e.target.value)} />
        </FormField>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-categoryId`}>
            Category<span aria-hidden="true" className="text-destructive"> *</span>
          </Label>
          <CategorySelect
            id={`${id}-categoryId`}
            categories={categories}
            value={categoryId}
            onChange={(v) => {
              setCategoryId(v);
              setErrors((e) => ({ ...e, categoryId: undefined }));
            }}
            aria-invalid={errors.categoryId ? true : undefined}
            aria-describedby={errors.categoryId ? `${id}-categoryId-error` : undefined}
          />
          {errors.categoryId ? (
            <p id={`${id}-categoryId-error`} role="alert" className="text-sm text-destructive">
              {errors.categoryId}
            </p>
          ) : null}
        </div>
        <FormField id={`${id}-price`} label="Price (৳)" error={errors.price} required>
          <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
        </FormField>
        <FormField
          id={`${id}-salePrice`}
          label="Sale price (৳)"
          error={errors.salePrice}
          hint={discount ? `Shown as −${discount}% (${formatBDT(Number(salePrice))}).` : "Optional. Flash sales are set under Offers."}
        >
          <Input
            inputMode="decimal"
            value={salePrice}
            onChange={(e) => {
              setSalePrice(e.target.value);
            }}
          />
        </FormField>
      </div>

      <FormField id={`${id}-description`} label="Description" error={errors.description} hint="Blank lines start a new paragraph." required>
        <Textarea rows={6} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${id}-material`} label="Material">
          <Input value={material} maxLength={120} placeholder="e.g. 100% cotton" onChange={(e) => setMaterial(e.target.value)} />
        </FormField>
        <FormField id={`${id}-care`} label="Care instructions">
          <Textarea rows={2} maxLength={500} value={care} onChange={(e) => setCare(e.target.value)} />
        </FormField>
      </div>

      <SpecsEditor rows={specs} onChange={setSpecs} />

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">Visibility and labels</legend>
        {(
          [
            ["active", "Visible in the shop", "Customers can find and buy it.", isActive, setActive],
            ["featured", "Featured", "Shown on the home page and the Featured row.", isFeatured, setFeatured],
            ["new", "New arrival", "Gets a “New” badge and appears in New arrivals.", isNewArrival, setNewArrival],
          ] as const
        ).map(([key, label, hint, value, set]) => (
          <div key={key} className="flex items-start gap-2">
            <Checkbox
              id={`${id}-${key}`}
              checked={value}
              onCheckedChange={(c) => set(c === true)}
              aria-describedby={`${id}-${key}-hint`}
              className="mt-0.5"
            />
            <div className="grid gap-0.5">
              <Label htmlFor={`${id}-${key}`}>{label}</Label>
              <p id={`${id}-${key}-hint`} className="text-sm text-muted-foreground">
                {hint}
              </p>
            </div>
          </div>
        ))}
      </fieldset>

      {children}

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
