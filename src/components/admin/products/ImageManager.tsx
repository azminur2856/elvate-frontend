"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { ProductImage as ProductImageData } from "@/types/commerce";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProductImage } from "@/components/shop/ProductImage";

const MAX_IMAGES = 8;
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

type Pending = { file: File; url: string };

const sortImages = (imgs: ProductImageData[]) =>
  [...imgs].sort((a, b) => a.sortOrder - b.sortOrder || Number(b.isMain) - Number(a.isMain));

/**
 * Product photos: multi-upload with previews + progress, set main,
 * reorder (left / right), delete. Every call returns the full image list.
 */
export function ImageManager({
  productId,
  images,
  onChange,
}: {
  productId: string;
  images: ProductImageData[];
  onChange: (images: ProductImageData[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ProductImageData | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const sorted = sortImages(images);
  const room = MAX_IMAGES - images.length - pending.length;

  // Free every preview object URL when the manager unmounts.
  const created = useRef<string[]>([]);
  useEffect(() => {
    const urls = created.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const addFiles = (list: FileList | File[] | null) => {
    if (!list) return;
    const files = Array.from(list);
    const accepted: Pending[] = [];
    const problems: string[] = [];
    for (const file of files) {
      if (!TYPES.includes(file.type)) problems.push(`${file.name}: use JPG, PNG or WebP.`);
      else if (file.size > MAX_BYTES) problems.push(`${file.name}: larger than 5 MB.`);
      else if (accepted.length >= room) problems.push(`${file.name}: a product can have at most ${MAX_IMAGES} images.`);
      else {
        const url = URL.createObjectURL(file);
        created.current.push(url);
        accepted.push({ file, url });
      }
    }
    if (problems.length) toast.error(problems.join("\n"));
    if (accepted.length) setPending((p) => [...p, ...accepted]);
  };

  const upload = async () => {
    if (!pending.length) return;
    const form = new FormData();
    pending.forEach((p) => form.append("files", p.file, p.file.name));
    setProgress(0);
    try {
      const res = await api.post<ProductImageData[]>(`/admin/products/${productId}/images`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setProgress(e.total ? Math.round((e.loaded / e.total) * 100) : null),
      });
      onChange(res.data);
      pending.forEach((p) => URL.revokeObjectURL(p.url));
      setPending([]);
      toast.success("Images uploaded.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload failed."));
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const setMain = async (img: ProductImageData) => {
    setBusy(img.id);
    try {
      const res = await api.patch<ProductImageData[]>(`/admin/products/${productId}/images/${img.id}`, { isMain: true });
      onChange(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not set the main image."));
    } finally {
      setBusy(null);
    }
  };

  /** Move one place left / right: renumber everything 0..n-1 and save what changed. */
  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= sorted.length) return;
    const order = [...sorted];
    [order[index], order[target]] = [order[target], order[index]];
    setBusy(order[target].id);
    try {
      let latest: ProductImageData[] | null = null;
      for (let i = 0; i < order.length; i++) {
        if (order[i].sortOrder !== i) {
          latest = (await api.patch<ProductImageData[]>(`/admin/products/${productId}/images/${order[i].id}`, { sortOrder: i })).data;
        }
      }
      if (latest) onChange(latest);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not reorder the images."));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(deleting.id);
    try {
      const res = await api.delete<ProductImageData[]>(`/admin/products/${productId}/images/${deleting.id}`);
      onChange(res.data);
      setDeleting(null);
      toast.success("Image deleted.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the image."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-4">
      {sorted.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((img, i) => (
            <li key={img.id} className={cn("overflow-hidden rounded-xl border bg-card", img.isMain && "ring-2 ring-primary")}>
              <div className="relative aspect-square">
                <ProductImage src={img.url} alt={`Image ${i + 1}${img.isMain ? " (main)" : ""}`} sizes="240px" />
                {img.isMain ? (
                  <Badge className="absolute left-2 top-2">
                    <Star aria-hidden="true" />
                    Main
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || busy !== null}
                    aria-label={`Move image ${i + 1} earlier`}
                  >
                    <ArrowLeft aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(i, 1)}
                    disabled={i === sorted.length - 1 || busy !== null}
                    aria-label={`Move image ${i + 1} later`}
                  >
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex">
                  {!img.isMain ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setMain(img)}
                      disabled={busy !== null}
                      aria-label={`Make image ${i + 1} the main image`}
                      title="Make main image"
                    >
                      <Star aria-hidden="true" />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleting(img)}
                    disabled={busy !== null}
                    aria-label={`Delete image ${i + 1}`}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No images yet. The first image you upload becomes the main image.</p>
      )}

      {room > 0 || pending.length ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "grid gap-3 rounded-xl border-2 border-dashed p-4 transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border"
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={room <= 0 || progress !== null}>
              <ImagePlus aria-hidden="true" />
              Choose images
            </Button>
            <p className="text-sm text-muted-foreground">
              or drop them here · JPG, PNG or WebP · up to 5 MB each · {Math.max(0, room)} of {MAX_IMAGES} slots left
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={TYPES.join(",")}
              multiple
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {pending.length ? (
            <>
              <ul className="flex flex-wrap gap-2" aria-label="Images ready to upload">
                {pending.map((p) => (
                  <li key={p.url} className="relative size-20 overflow-hidden rounded-lg border">
                    <Image src={p.url} alt={p.file.name} fill unoptimized sizes="80px" className="object-cover" />
                    {progress === null ? (
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(p.url);
                          setPending((list) => list.filter((x) => x.url !== p.url));
                        }}
                        className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5"
                        aria-label={`Remove ${p.file.name}`}
                      >
                        <X aria-hidden="true" className="size-3.5" />
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
              {progress !== null ? (
                <div className="grid gap-1">
                  <div
                    role="progressbar"
                    aria-label="Upload progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    className="h-2 overflow-hidden rounded-full bg-muted"
                  >
                    <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
                </div>
              ) : (
                <Button type="button" className="justify-self-start" onClick={upload}>
                  <UploadCloud aria-hidden="true" />
                  Upload {pending.length} {pending.length === 1 ? "image" : "images"}
                </Button>
              )}
            </>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">This product has the maximum of {MAX_IMAGES} images.</p>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && busy === null && setDeleting(null)}
        title="Delete this image?"
        description="It is removed from the product and from image storage."
        confirmLabel="Delete"
        destructive
        loading={busy !== null && deleting !== null}
        onConfirm={remove}
      />
    </div>
  );
}
