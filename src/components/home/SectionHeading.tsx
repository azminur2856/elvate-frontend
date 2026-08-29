import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** id for the <h2>, referenced by the section's aria-labelledby. */
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

/** Eyebrow + real <h2> for homepage sections (the eyebrow is not a heading). */
export function SectionHeading({ id, eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>
      ) : null}
      <h2 id={id} className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
