import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/** Breadcrumb trail; the last crumb is the current page (not a link). */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link href={c.href} className="hover:text-foreground hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "font-medium text-foreground")}>
                  {c.label}
                </span>
              )}
              {!last ? <ChevronRight aria-hidden="true" className="size-3.5" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
