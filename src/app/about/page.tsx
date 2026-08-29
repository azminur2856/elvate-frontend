import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Lightbulb, Rocket, Users } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "Elvate is an all-in-one digital platform with smart tools and e-commerce for everyone.",
};

const features: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Rocket, title: "Fast & powerful", description: "Blazing-fast performance and industry-grade technology in every tool." },
  { icon: Lightbulb, title: "Innovative services", description: "From image editing to advanced OCR and e-commerce features, Elvate stays ahead." },
  { icon: Users, title: "For everyone", description: "Designed for individuals, creators and businesses of all sizes." },
];

export default function AboutPage() {
  return (
    <PageShell width="md" title="About Elvate">
      <div className="grid gap-8">
        <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Elvate</span> is your all-in-one
          digital platform offering smart tools and e-commerce solutions to empower everyone
          — from students to professionals and small businesses. Our mission is to make
          powerful digital services like OCR, image editing and background removal
          accessible, secure and lightning-fast.
        </p>
        <ul className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title}>
              <Card className="h-full">
                <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted text-brand">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
        <p className="text-center text-sm text-muted-foreground">
          Built in Bangladesh · Powered by a passion for technology and simplicity.
        </p>
      </div>
    </PageShell>
  );
}
