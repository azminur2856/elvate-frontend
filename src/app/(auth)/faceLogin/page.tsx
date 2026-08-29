import type { Metadata } from "next";
import FaceLoginClient from "./FaceLoginClient";

export const metadata: Metadata = { title: "Face login" };

export default function FaceLoginPage() {
  return <FaceLoginClient />;
}
