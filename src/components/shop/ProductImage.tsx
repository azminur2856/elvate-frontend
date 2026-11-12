"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { isShopImagePath, shopImageLoader } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * How next/image should load a shop photo. `/img/...` (BE-28) gets sized
 * URLs from the image CDN through our rewrite, so Vercel's optimiser (and its
 * quota) is never used; anything else (e.g. an admin-entered category image
 * URL) loads as it is.
 */
export function shopImageProps(src: string): Pick<ImageProps, "loader" | "unoptimized"> {
  return isShopImagePath(src) ? { loader: shopImageLoader } : { unoptimized: true };
}

type ProductImageProps = {
  src: string | null | undefined;
  alt: string;
  /** Responsive `sizes` hint for next/image. */
  sizes?: string;
  priority?: boolean;
  /** Classes for the <img> (object-fit, hover transform …). */
  className?: string;
  /** Classes for the wrapper; it is `relative` and fills its parent by default. */
  wrapperClassName?: string;
};

/**
 * Fills its (positioned, sized) parent; see `shopImageProps` for how it loads.
 * Without a URL, or when the image fails to load, it shows a neutral placeholder.
 */
export function ProductImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  priority,
  className,
  wrapperClassName,
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground",
          wrapperClassName
        )}
      >
        <ImageOff aria-hidden="true" className="size-8 opacity-60" />
        {alt ? <span className="sr-only">{alt}: no image</span> : null}
      </div>
    );
  }
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-muted", wrapperClassName)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        {...shopImageProps(src)}
        onError={() => setFailedSrc(src)}
        className={cn("object-cover", className)}
      />
    </div>
  );
}
