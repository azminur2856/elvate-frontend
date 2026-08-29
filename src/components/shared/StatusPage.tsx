import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";

type StatusPageProps = {
  code?: string | number;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  /** Extra controls, e.g. a "Try again" button on the error boundary. */
  children?: React.ReactNode;
};

/** 403 / 404 / error-boundary layout. */
export function StatusPage({
  code,
  title,
  description,
  action = { href: "/", label: "Back to home" },
  children,
}: StatusPageProps) {
  return (
    <PageShell width="sm" center>
      <div className="flex w-full flex-col items-center gap-4 text-center">
        {code ? (
          <p className="font-mono text-6xl font-semibold tabular-nums text-muted-foreground">
            {code}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold">{title}</h1>
        {description ? (
          <p className="max-w-prose text-muted-foreground">{description}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {children}
          <Button asChild variant={children ? "outline" : "default"}>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
