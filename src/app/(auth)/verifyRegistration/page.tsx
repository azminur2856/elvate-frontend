import { Suspense } from "react";
import VerifyRegistrationClient from "./VerifyRegistrationClient";

export default function VerifyRegistrationPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Verifying...</div>}>
      <VerifyRegistrationClient />
    </Suspense>
  );
}
