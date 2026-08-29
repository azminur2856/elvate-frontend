import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { ThemedToaster } from "@/components/ui/themed-toaster";

// Poppins is not a variable font on Google Fonts: weights must be listed.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Elvate",
    template: "%s | Elvate",
  },
  description:
    "Elvate — digital services, AI-powered tools and products in one place. Convert PDFs and images to text, resize and edit images, and manage your subscription.",
  applicationName: "Elvate",
  openGraph: {
    type: "website",
    siteName: "Elvate",
    title: "Elvate",
    description:
      "Digital services, AI-powered tools and products in one place.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Elvate",
    description:
      "Digital services, AI-powered tools and products in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${openSans.variable}`}
    >
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="pt-[var(--navbar-h)]">
            {children}
          </main>
          <Footer />
          <ThemedToaster />
        </Providers>
      </body>
    </html>
  );
}
