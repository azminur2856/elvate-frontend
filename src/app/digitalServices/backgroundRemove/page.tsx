import type { Metadata } from "next";
import BackgroundRemoveClient from "./BackgroundRemoveClient";

export const metadata: Metadata = {
  title: "Background Remove",
  description: "Cut the background out of a photo.",
};

export default function BackgroundRemovePage() {
  return <BackgroundRemoveClient />;
}
