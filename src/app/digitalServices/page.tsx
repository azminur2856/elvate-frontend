import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import digitalServiceData from "@/data/digitalServices.json";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Digital Services",
  description:
    "OCR, image editing, background removal and more — fast, accurate digital tools.",
};

interface DigitalService {
  id: number;
  title: string;
  description: string;
  slug: string;
  isFeatured: boolean;
}

export default function DigitalServicesPage() {
  const services: DigitalService[] = digitalServiceData.digitalServices;
  return (
    <PageShell
      width="xl"
      title="Digital Services"
      description="Unlock premium features — OCR, image editing, background removal and more. Fast, accurate and secure digital tools for every need."
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.id}>
            <CardSpotlight className="flex h-full min-h-64 flex-col">
              <div className="relative z-20 flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">{service.title}</h2>
                  <Badge variant={service.isFeatured ? "brand" : "secondary"}>
                    {service.isFeatured ? "Featured" : "Standard"}
                  </Badge>
                </div>
                <p className="mt-3 flex-1 text-muted-foreground">
                  {service.description}
                </p>
                <Button asChild className="mt-6 w-full sm:w-auto sm:self-start">
                  <Link href={`/digitalServices/${service.slug}`}>
                    Open tool
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </CardSpotlight>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
