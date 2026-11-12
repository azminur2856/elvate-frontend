import type { Metadata } from "next";
import ReviewsClient from "./ReviewsClient";

export const metadata: Metadata = { title: "Reviews" };

export default function AdminReviewsPage() {
  return <ReviewsClient />;
}
