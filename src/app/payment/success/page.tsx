import dynamic from "next/dynamic";

// ✅ Dynamically load client-only component with SSR disabled
const PaymentSuccessClient = dynamic(() => import("./PaymentSuccessClient"), {
  ssr: false,
});

export default function Page() {
  return <PaymentSuccessClient />;
}
