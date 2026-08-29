import { cn } from "@/lib/utils";

const widths = {
  sm: "max-w-md",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
} as const;

type PageShellProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Controls rendered to the right of the title (filters, buttons). */
  actions?: React.ReactNode;
  width?: keyof typeof widths;
  /** Vertically centre the content (auth cards, status pages). */
  center?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Standard page container: consistent horizontal padding, top/bottom
 * spacing below the fixed navbar, max-width, and an optional <h1>.
 */
export function PageShell({
  title,
  description,
  actions,
  width = "lg",
  center = false,
  className,
  children,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-h-[calc(100svh-var(--navbar-h))] flex-col px-4 py-10 sm:px-6",
        widths[width],
        center && "items-center justify-center",
        className
      )}
    >
      {title || description || actions ? (
        <header
          className={cn(
            "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
            center && "w-full text-center sm:flex-col sm:items-center"
          )}
        >
          <div>
            {title ? (
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-2 max-w-prose text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}
