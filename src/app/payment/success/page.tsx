// src/app/payment/success/page.tsx
"use client";
import { Suspense } from "react";
import PaymentSuccessClient from "./PaymentSuccessClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
