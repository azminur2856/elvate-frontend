import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full max-w-md" />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
