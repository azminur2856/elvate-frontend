import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/shared/PageShell";
import { cn } from "@/lib/utils";

type ToolPageShellProps = {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  /** Left panel: upload / preview / controls. */
  input: React.ReactNode;
  /** Optional centre action (the "run" button). */
  action?: React.ReactNode;
  /** Right panel: result. */
  output: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * Responsive layout for the digital-service tools:
 * stacked on small screens, input | action | output from `lg`.
 */
export function ToolPageShell({
  title,
  description,
  badge,
  input,
  action,
  output,
  children,
}: ToolPageShellProps) {
  return (
    <PageShell
      width="xl"
      title={
        <span className="inline-flex flex-wrap items-center gap-3">
          {title}
          {badge}
        </span>
      }
      description={description}
    >
      <div
        className={cn(
          "grid gap-4",
          action ? "lg:grid-cols-[1fr_auto_1fr]" : "lg:grid-cols-2"
        )}
      >
        <ToolPanel>{input}</ToolPanel>
        {action ? (
          <div className="flex items-center justify-center lg:flex-col">
            <div className="hidden h-full w-px bg-border lg:block" aria-hidden="true" />
            <div className="w-full lg:w-auto lg:py-4">{action}</div>
            <div className="hidden h-full w-px bg-border lg:block" aria-hidden="true" />
          </div>
        ) : null}
        <ToolPanel>{output}</ToolPanel>
      </div>
      {children}
    </PageShell>
  );
}

export function ToolPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-h-[420px] flex-col rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      {children}
    </section>
  );
}

/** Small badge used by tools whose backend isn't finished. */
export function ComingSoonBadge() {
  return <Badge variant="warning">Coming soon</Badge>;
}
