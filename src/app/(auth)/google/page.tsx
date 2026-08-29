import type { Metadata } from "next";
import GoogleLoginClient from "./GoogleLoginClient";

export const metadata: Metadata = { title: "Signed in with Google" };

export default function GoogleLoginSuccessPage() {
  return <GoogleLoginClient />;
}
