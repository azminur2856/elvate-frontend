import type { Metadata } from "next";
import ImageResizeClient from "./ImageResizeClient";

export const metadata: Metadata = {
  title: "Image Resize",
  description: "Resize images to presets or exact pixel dimensions.",
};

export default function ImageResizePage() {
  return <ImageResizeClient />;
}
