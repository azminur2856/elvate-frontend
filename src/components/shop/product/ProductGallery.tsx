"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage as ProductImageData } from "@/types/commerce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductImage, shopImageProps } from "../ProductImage";

/**
 * Main image + thumbnails. Keyboard: Tab to the image and use ← / →, or
 * Tab through the thumbnail buttons. The position is announced politely.
 */
export function ProductGallery({ images, name }: { images: ProductImageData[]; name: string }) {
  const sorted = [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.sortOrder - b.sortOrder);
  const [index, setIndex] = useState(0);
  const count = sorted.length;
  const current = sorted[index] ?? null;
  const go = (i: number) => setIndex((i + count) % count);

  return (
    <div className="grid gap-3">
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl border bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        tabIndex={count > 1 ? 0 : -1}
        role={count > 1 ? "group" : undefined}
        aria-roledescription={count > 1 ? "image gallery" : undefined}
        aria-label={count > 1 ? `${name} images. Use the left and right arrow keys to browse.` : undefined}
        onKeyDown={(e) => {
          if (count < 2) return;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(index + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(index - 1);
          }
        }}
      >
        <ProductImage
          key={current?.id ?? "none"}
          src={current?.url}
          alt={count > 1 ? `${name}, image ${index + 1} of ${count}` : name}
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority={index === 0}
          className="object-contain sm:object-cover"
        />
        {count > 1 ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full opacity-90 shadow-md"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              tabIndex={-1}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full opacity-90 shadow-md"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              tabIndex={-1}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            <span className="absolute bottom-3 right-3 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium tabular-nums">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {count > 1 ? `Image ${index + 1} of ${count}` : ""}
        </p>
      </div>

      {count > 1 ? (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {sorted.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                  i === index ? "border-primary" : "border-transparent hover:border-border"
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="96px"
                  {...shopImageProps(img.url)}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
