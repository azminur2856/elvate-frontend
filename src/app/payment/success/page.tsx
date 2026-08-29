import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import PaymentSuccessClient from "./PaymentSuccessClient";

export const metadata: Metadata = { title: "Payment successful" };

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <PageShell width="sm" center>
          <Skeleton className="h-72 w-full" />
        </PageShell>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}
