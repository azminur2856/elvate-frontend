"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FolderOpen, FolderTree, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { categoryHref, isRootCategory } from "@/lib/catalog-url";
import { getErrorMessage } from "@/lib/errors";
import { isShopImagePath } from "@/lib/media";
import { slugify, SLUG_RE } from "@/lib/slug";
import type { Category } from "@/types/commerce";
import { subtreeIds, useCategoryTree, type FlatCategory } from "@/hooks/useCategoryTree";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { PageShell } from "@/components/shared/PageShell";
import { ProductImage } from "@/components/shop/ProductImage";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Editing = { mode: "create"; parent: Category | null } | { mode: "edit"; category: Category };

function CategoryDialog({
  editing,
  flat,
  onClose,
  onSaved,
}: {
  editing: Editing;
  flat: FlatCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const existing = editing.mode === "edit" ? editing.category : null;
  const root = existing ? !existing.parentId : false;
  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [parentId, setParentId] = useState<string | null>(
    existing ? existing.parentId : editing.mode === "create" ? (editing.parent?.id ?? null) : null
  );
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? "");
  const [sortOrder, setSortOrder] = useState(String(existing?.sortOrder ?? 0));
  const [errors, setErrors] = useState<{ name?: string; slug?: string; imageUrl?: string; sortOrder?: string }>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const parent = flat.find((c) => c.id === parentId) ?? null;
  // What the backend will generate when the slug is left empty.
  const defaultSlug = name.trim() ? (parent ? `${parent.slug}-${slugify(name)}` : slugify(name)) : "";
  const blocked = existing ? subtreeIds(existing) : [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Enter a name.";
    if (slug.trim() && !SLUG_RE.test(slug.trim())) next.slug = "Use lowercase letters, numbers and single dashes.";
    // A full URL, or a shop photo path the API sent back (`/img/...`, BE-28).
    if (imageUrl.trim() && !isShopImagePath(imageUrl.trim())) {
      try {
        new URL(imageUrl.trim());
      } catch {
        next.imageUrl = "Enter a full URL starting with https://";
      }
    }
    if (!/^-?\d+$/.test(sortOrder.trim())) next.sortOrder = "Use a whole number.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const body: Record<string, unknown> = {
      name: name.trim(),
      sortOrder: Number(sortOrder),
      imageUrl: imageUrl.trim() || (existing?.imageUrl ? null : undefined),
    };
    if (!root) {
      body.parentId = parentId;
      if (slug.trim() && slug.trim() !== existing?.slug) body.slug = slug.trim();
    }
    setSaving(true);
    setFormError("");
    try {
      if (existing) await api.patch(`/categories/${existing.id}`, body);
      else await api.post("/categories", body);
      toast.success(existing ? "Category updated." : "Category created.");
      onSaved();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not save the category."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? `Edit ${existing.name}` : parent ? `New category in ${parent.name}` : "New category"}</DialogTitle>
          <DialogDescription>
            {root
              ? "Men, Women and Children are fixed: you can rename them and change the image or order, but not the slug or parent."
              : "Categories group products in the shop menu and filters."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          {formError ? <FormMessage variant="error">{formError}</FormMessage> : null}
          <FormField id="cat-name" label="Name" error={errors.name} required>
            <Input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField
            id="cat-slug"
            label="URL slug"
            error={errors.slug}
            hint={
              root
                ? "Fixed for root categories."
                : existing
                  ? "Changing it changes the page address. Renaming does not change it."
                  : `Leave empty to use ${defaultSlug || "an automatic slug"}.`
            }
          >
            <Input
              value={slug}
              disabled={root}
              placeholder={existing ? undefined : defaultSlug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              className="font-mono"
            />
          </FormField>
          <div className="grid gap-1.5">
            <label htmlFor="cat-parent" className="text-sm font-medium">
              Parent
            </label>
            <CategorySelect
              id="cat-parent"
              categories={flat}
              value={parentId}
              onChange={setParentId}
              noneLabel="None (top level)"
              disabledIds={blocked}
            />
            {root ? <p className="text-sm text-muted-foreground">Root categories stay at the top level.</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <FormField id="cat-image" label="Image URL" error={errors.imageUrl} hint="Optional. Shown on the shop tiles.">
              <Input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            </FormField>
            <FormField id="cat-sort" label="Sort order" error={errors.sortOrder} hint="Lower first">
              <Input inputMode="numeric" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </FormField>
          </div>
          {imageUrl.trim() && !errors.imageUrl ? (
            <div className="relative h-24 w-36 overflow-hidden rounded-lg border">
              <ProductImage src={imageUrl.trim()} alt="Image preview" sizes="144px" />
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {existing ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TreeNode({
  node,
  onAdd,
  onEdit,
  onDelete,
}: {
  node: Category;
  onAdd: (parent: Category) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const root = !node.parentId;
  const locked = root && isRootCategory(node.slug);
  return (
    <li>
      <div className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50">
        {node.imageUrl ? (
          <span className="relative size-9 shrink-0 overflow-hidden rounded-md border">
            <ProductImage src={node.imageUrl} alt="" sizes="36px" />
          </span>
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {node.children?.length ? <FolderTree aria-hidden="true" className="size-4" /> : <FolderOpen aria-hidden="true" className="size-4" />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            {node.name}
            {locked ? (
              <Badge variant="outline">
                <Lock aria-hidden="true" />
                Root
              </Badge>
            ) : null}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono">{node.slug}</span> · {node.productCount}{" "}
            {node.productCount === 1 ? "product" : "products"} · order {node.sortOrder}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onAdd(node)} aria-label={`Add a category inside ${node.name}`}>
            <Plus aria-hidden="true" />
            <span className="hidden sm:inline" aria-hidden="true">
              Sub-category
            </span>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(node)} aria-label={`Edit ${node.name}`}>
            <Pencil aria-hidden="true" />
          </Button>
          <Button asChild variant="ghost" size="icon-sm">
            <Link href={categoryHref(node.slug)} target="_blank" aria-label={`Open ${node.name} in the shop (new tab)`}>
              <ExternalLink aria-hidden="true" />
            </Link>
          </Button>
          {locked ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-flex rounded-md focus-visible:ring-2 focus-visible:ring-ring">
                  <Button variant="ghost" size="icon-sm" disabled aria-label={`${node.name} can't be deleted`}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Root categories can&apos;t be deleted</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(node)}
              aria-label={`Delete ${node.name}`}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      {node.children?.length ? (
        <ul className="ml-6 border-l pl-3">
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function CategoriesClient() {
  const { tree, flat, error, loading, reload } = useCategoryTree();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/categories/${deleting.id}`);
      toast.success(`${deleting.name} deleted.`);
      setDeleting(null);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the category."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      width="lg"
      title="Categories"
      description="The category tree used by the shop menu, filters and product forms."
      actions={
        <Button onClick={() => setEditing({ mode: "create", parent: null })}>
          <Plus aria-hidden="true" />
          New category
        </Button>
      }
    >
      {error ? <FormMessage variant="error" className="mb-4">{error}</FormMessage> : null}
      {loading && !tree ? (
        <div role="status" aria-label="Loading categories" className="grid gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : tree && tree.length ? (
        <ul aria-label="Category tree" className="grid gap-1 rounded-xl border bg-card p-2" aria-busy={loading}>
          {tree.map((n) => (
            <TreeNode
              key={n.id}
              node={n}
              onAdd={(parent) => setEditing({ mode: "create", parent })}
              onEdit={(category) => setEditing({ mode: "edit", category })}
              onDelete={setDeleting}
            />
          ))}
        </ul>
      ) : !error ? (
        <p className="text-muted-foreground">No categories yet.</p>
      ) : null}

      {editing ? (
        <CategoryDialog
          key={editing.mode === "edit" ? editing.category.id : `new-${editing.parent?.id ?? "root"}`}
          editing={editing}
          flat={flat}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void reload();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && !busy && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "category"}?`}
        description="Only empty categories can be deleted: move or delete its sub-categories and products first."
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
      />
    </PageShell>
  );
}
