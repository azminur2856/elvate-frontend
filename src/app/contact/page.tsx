import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Elvate team.",
};

const items = [
  { icon: Mail, label: "Email", value: "support@elvate.com", href: "mailto:support@elvate.com" },
  { icon: Phone, label: "Phone", value: "+880 1234-567890", href: "tel:+8801234567890" },
  { icon: MapPin, label: "Address", value: "Ka-96/1, Kazi Bari, Kuril Bisho Road, Dhaka, Bangladesh" },
];

export default function ContactPage() {
  return (
    <PageShell width="sm" title="Contact Elvate" description="Questions, support or partnerships — we're happy to hear from you.">
      <Card>
        <CardContent className="pt-6">
          <dl className="grid gap-5">
            {items.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-brand">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="font-medium">
                    {href ? (
                      <a href={href} className="text-link hover:underline">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-muted-foreground">We usually reply within 24 hours.</p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
