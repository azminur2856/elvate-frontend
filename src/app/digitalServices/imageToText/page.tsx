import type { Metadata } from "next";
import ImageToTextClient from "./ImageToTextClient";

export const metadata: Metadata = {
  title: "Image to Text",
  description: "Extract text from photos and scanned images with OCR.",
};

export default function ImageToTextPage() {
  return <ImageToTextClient />;
}
