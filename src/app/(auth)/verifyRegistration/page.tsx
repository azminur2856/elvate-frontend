import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import VerifyRegistrationClient from "./VerifyRegistrationClient";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyRegistrationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full max-w-md" />}>
      <VerifyRegistrationClient />
    </Suspense>
  );
}
