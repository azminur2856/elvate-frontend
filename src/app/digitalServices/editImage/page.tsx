import type { Metadata } from "next";
import EditImageClient from "./EditImageClient";

export const metadata: Metadata = {
  title: "Edit Image",
  description: "Crop, resize, rotate and adjust your photos.",
};

export default function EditImagePage() {
  return <EditImageClient />;
}
