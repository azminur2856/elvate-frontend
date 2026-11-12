"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { Review } from "@/types/commerce";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RatingInput } from "./RatingInput";

const MAX_COMMENT = 1000;

type ReviewDialogProps = {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the created (PENDING) review. */
  onSubmitted?: (review: Review) => void;
};

/** `POST /products/:productId/reviews`. Reviews are moderated before they show. */
export function ReviewDialog({ productId, productName, open, onOpenChange, onSubmitted }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setRating(0);
    setComment("");
    setRatingError("");
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setRatingError("Please choose a rating.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await api.post<Review>(`/products/${encodeURIComponent(productId)}/reviews`, {
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Thanks! Your review will appear once it's approved.");
      onSubmitted?.(res.data);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send your review."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review {productName}</DialogTitle>
          <DialogDescription>Reviews are checked by our team before they are published.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5" noValidate>
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}
          <RatingInput
            value={rating}
            onChange={(r) => {
              setRating(r);
              setRatingError("");
            }}
            error={ratingError}
          />
          <FormField
            id="review-comment"
            label="Your review (optional)"
            hint={`${comment.length}/${MAX_COMMENT} characters`}
          >
            <Textarea
              rows={5}
              maxLength={MAX_COMMENT}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the fit, fabric and delivery?"
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Submit review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
