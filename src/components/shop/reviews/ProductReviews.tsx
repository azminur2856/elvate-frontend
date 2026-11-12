"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { loginHref } from "@/lib/redirect";
import type { ProductReviewsPage, Review, ReviewEligibility } from "@/types/commerce";
import { useCart } from "@/components/cart/CartProvider";
import { LocalTime } from "@/components/shared/LocalTime";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { RatingStars } from "../RatingStars";
import { ReviewDialog } from "./ReviewDialog";

const PAGE_SIZE = 5;

function Summary({ data }: { data: Pick<ProductReviewsPage, "average" | "count" | "distribution"> }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <p className="font-heading text-5xl font-bold tabular-nums">{data.average.toFixed(1)}</p>
        <div>
          <RatingStars rating={data.average} size="lg" />
          <p className="mt-1 text-sm text-muted-foreground">
            Based on {data.count} {data.count === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>
      <ul className="grid gap-1.5" aria-label="Rating distribution">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const n = data.distribution?.[star] ?? 0;
          const pct = data.count ? Math.round((n / data.count) * 100) : 0;
          return (
            <li key={star} className="flex items-center gap-3 text-sm">
              <span className="w-12 shrink-0 text-muted-foreground">{star} star</span>
              <span aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">{pct}%</span>
              <span className="sr-only">
                {n} {n === 1 ? "review" : "reviews"} with {star} {star === 1 ? "star" : "stars"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const name = review.user?.name ?? "Customer";
  // BE-28 sends `/media/avatar/<key>`; before that a full picture URL.
  const avatar = review.user?.avatar ?? null;
  const ours = avatar?.startsWith("/media/") ?? false;
  return (
    <article className="grid gap-2 py-5">
      <div className="flex items-center gap-3">
        <UserAvatar
          name={name}
          size="xs"
          className="size-9"
          avatarUrl={ours ? avatar : undefined}
          legacySrc={ours ? undefined : (avatar ?? undefined)}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{name}</p>
          <LocalTime value={review.createdAt} className="text-xs text-muted-foreground" />
        </div>
      </div>
      <RatingStars rating={review.rating} size="sm" />
      {review.comment ? <p className="whitespace-pre-line text-sm leading-relaxed">{review.comment}</p> : null}
    </article>
  );
}

function WriteReview({ productId, productName, slug }: { productId: string; productName: string; slug: string }) {
  const { loggedIn } = useCart();
  const pathname = usePathname();
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    api
      .get<ReviewEligibility>(`/products/${encodeURIComponent(slug)}/reviews/eligibility`)
      .then((res) => !cancelled && setEligibility(res.data))
      .catch(() => !cancelled && setEligibility(null));
    return () => {
      cancelled = true;
    };
  }, [loggedIn, slug]);

  if (!loggedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        Bought this item?{" "}
        <Link href={loginHref(`${pathname}#reviews`)} className="text-link hover:underline">
          Log in
        </Link>{" "}
        to review it.
      </p>
    );
  }
  if (!eligibility) return null;
  if (!eligibility.canReview) {
    return eligibility.reason ? <p className="text-sm text-muted-foreground">{eligibility.reason}</p> : null;
  }
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <MessageSquarePlus aria-hidden="true" />
        Write a review
      </Button>
      <ReviewDialog
        productId={productId}
        productName={productName}
        open={open}
        onOpenChange={setOpen}
        onSubmitted={() => setEligibility({ canReview: false, reason: "Thanks for your review! It will appear once approved." })}
      />
    </>
  );
}

/** Reviews block on the product page: summary, list with "show more", write a review. */
export function ProductReviews({
  slug,
  productId,
  productName,
  initial,
}: {
  slug: string;
  productId: string;
  productName: string;
  /** First page from the server; null when the reviews API is unavailable. */
  initial: ProductReviewsPage | null;
}) {
  const [items, setItems] = useState<Review[]>(initial?.items ?? []);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [totalPages, setTotalPages] = useState(initial?.totalPages ?? 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMore = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<ProductReviewsPage>(`/products/${encodeURIComponent(slug)}/reviews`, {
        params: { page: page + 1, pageSize: PAGE_SIZE },
      });
      setItems((prev) => [...prev, ...res.data.items.filter((r) => !prev.some((p) => p.id === r.id))]);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load more reviews."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-[calc(var(--navbar-h)+1rem)]">
      <h2 id="reviews-heading" className="text-2xl font-bold tracking-tight">
        Customer reviews
      </h2>
      <div className="mt-6 grid gap-10 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="grid content-start gap-6">
          {initial && initial.count > 0 ? (
            <Summary data={initial} />
          ) : (
            <p className="text-muted-foreground">{initial ? "No reviews yet." : "Reviews are unavailable right now."}</p>
          )}
          <WriteReview productId={productId} productName={productName} slug={slug} />
        </div>
        <div>
          {items.length ? (
            <ul className="divide-y border-y">
              {items.map((r) => (
                <li key={r.id}>
                  <ReviewItem review={r} />
                </li>
              ))}
            </ul>
          ) : initial && initial.count > 0 ? null : (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Be the first to share your thoughts after your order arrives.
            </p>
          )}
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          {page < totalPages ? (
            <Button variant="outline" className="mt-5" onClick={loadMore} loading={loading}>
              Show more reviews
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
