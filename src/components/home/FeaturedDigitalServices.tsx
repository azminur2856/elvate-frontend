import Link from "next/link";
import { ArrowRight } from "lucide-react";
import digitalData from "@/data/digitalServices.json";
import { BackgroundGradient } from "../ui/background-gradient";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";

interface DigitalService {
  id: number;
  title: string;
  slug: string;
  description: string;
  isFeatured: boolean;
}

function FeaturedDigitalServices() {
  const featured = digitalData.digitalServices.filter((s: DigitalService) => s.isFeatured);

  return (
    <section className="bg-muted/40 py-16 sm:py-20" aria-labelledby="featured-services">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Featured digital services"
          title="Boost your productivity with AI tools"
        />
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((service: DigitalService) => (
            <li key={service.id} className="flex justify-center">
              <BackgroundGradient
                containerClassName="w-full max-w-sm"
                className="flex h-full flex-col rounded-2xl bg-card p-6 text-center"
              >
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{service.description}</p>
                <Button asChild variant="link" className="mt-4 self-center text-link">
                  <Link href={`/digitalServices/${service.slug}`}>
                    Try it now
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </BackgroundGradient>
            </li>
          ))}
        </ul>
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/digitalServices">View all services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedDigitalServices;
