import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/shared/PageShell";

type ComingSoonProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  backHref?: string;
  backLabel?: string;
};

/** Shared placeholder for routes that are not built yet. */
export function ComingSoon({
  title,
  description = "We're working on this. Check back soon.",
  icon: Icon = Hammer,
  badge = "Coming soon",
  backHref = "/",
  backLabel = "Back to home",
}: ComingSoonProps) {
  return (
    <PageShell width="sm" center>
      <Card className="w-full text-center">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-brand">
            <Icon aria-hidden="true" className="size-7" />
          </span>
          <Badge variant="warning">{badge}</Badge>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
          <Button asChild variant="outline">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}
