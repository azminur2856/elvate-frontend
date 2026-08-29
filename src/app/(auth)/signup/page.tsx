import type { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return <SignupClient />;
}
