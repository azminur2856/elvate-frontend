"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, MessageSquareText, X } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { productHref } from "@/lib/catalog-url";
import { getErrorMessage } from "@/lib/errors";
import { REVIEWS_CHANGED_EVENT } from "@/lib/events";
import type { Paginated, Review } from "@/types/commerce";
import { LocalTime } from "@/components/shared/LocalTime";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState } from "@/components/shop/EmptyState";
import { ProductImage } from "@/components/shop/ProductImage";
import { RatingStars } from "@/components/shop/RatingStars";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGE_SIZE = 10;
type Status = Review["status"];
const TABS: { value: Status; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

function ReviewCard({
  review,
  busy,
  onDecide,
}: {
  review: Review;
  busy: boolean;
  onDecide: (r: Review, status: "APPROVED" | "REJECTED") => void;
}) {
  const p = review.product;
  return (
    <article className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div className="grid gap-3">
        {p ? (
          <Link href={productHref(p.slug)} target="_blank" className="flex items-center gap-3 hover:underline">
            <span className="relative size-10 shrink-0 overflow-hidden rounded-md border">
              <ProductImage src={p.image} alt="" sizes="40px" />
            </span>
            <span className="font-medium">{p.name}</span>
            <span className="sr-only">(opens in a new tab)</span>
          </Link>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <RatingStars rating={review.rating} size="sm" />
          <span className="font-medium">{review.user?.name ?? "Deleted user"}</span>
          <LocalTime value={review.createdAt} mode="datetime" className="text-muted-foreground" />
        </div>
        {review.comment ? (
          <p className="whitespace-pre-line text-sm leading-relaxed">{review.comment}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">No written comment.</p>
        )}
      </div>
      <div className="flex gap-2 sm:flex-col">
        {review.status !== "APPROVED" ? (
          <Button size="sm" onClick={() => onDecide(review, "APPROVED")} disabled={busy}>
            <Check aria-hidden="true" />
            Approve
          </Button>
        ) : null}
        {review.status !== "REJECTED" ? (
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => onDecide(review, "REJECTED")}
            disabled={busy}
          >
            <X aria-hidden="true" />
            Reject
          </Button>
        ) : null}
      </div>
    </article>
  );
}

/** Moderation queue: approved reviews show in the shop and count towards ratings. */
export default function ReviewsClient() {
  const [status, setStatus] = useState<Status>("PENDING");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Review> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get<Paginated<Review>>("/admin/reviews", { params: { page, pageSize: PAGE_SIZE, status } })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(getErrorMessage(err, "Could not load reviews."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, page, reloadKey]);

  const decide = async (review: Review, next: "APPROVED" | "REJECTED") => {
    setBusyId(review.id);
    try {
      await api.patch(`/admin/reviews/${review.id}/status`, { status: next });
      toast.success(next === "APPROVED" ? "Review approved and published." : "Review rejected.");
      // Drop it from this tab right away, then refresh the page of results.
      setData((d) => (d ? { ...d, items: d.items.filter((r) => r.id !== review.id), total: Math.max(0, d.total - 1) } : d));
      window.dispatchEvent(new Event(REVIEWS_CHANGED_EVENT));
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the review."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageShell
      width="lg"
      title="Reviews"
      description="Approved reviews appear on product pages and count towards the rating."
    >
      <Tabs
        value={status}
        onValueChange={(v) => {
          setStatus(v as Status);
          setPage(1);
        }}
      >
        <TabsList aria-label="Review status">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              {t.value === status && data ? (
                <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">{data.total}</span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={status} aria-live="polite" aria-busy={loading}>
        {error ? <FormMessage variant="error">{error}</FormMessage> : null}
        {loading && !data ? (
          <div role="status" aria-label="Loading reviews" className="grid gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : data && data.items.length ? (
          <ul className="grid gap-3">
            {data.items.map((r) => (
              <li key={r.id}>
                <ReviewCard review={r} busy={busyId === r.id} onDecide={decide} />
              </li>
            ))}
          </ul>
        ) : !error ? (
          <EmptyState
            icon={MessageSquareText}
            title={status === "PENDING" ? "Nothing to review" : `No ${status.toLowerCase()} reviews`}
            description={status === "PENDING" ? "New reviews from customers will appear here." : undefined}
          />
        ) : null}
        </TabsContent>
      </Tabs>
      {data && data.totalPages > 1 ? (
        <PaginationControls className="mt-6" page={page} totalPages={data.totalPages} onPageChange={setPage} />
      ) : null}
    </PageShell>
  );
}
