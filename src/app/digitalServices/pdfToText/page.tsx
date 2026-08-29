import type { Metadata } from "next";
import PdfToTextClient from "./PdfToTextClient";

export const metadata: Metadata = {
  title: "PDF to Text",
  description: "Extract text from PDF files with OCR.",
};

export default function PdfToTextPage() {
  return <PdfToTextClient />;
}
