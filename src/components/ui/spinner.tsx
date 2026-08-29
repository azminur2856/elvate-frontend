import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-4",
  md: "size-6",
  lg: "size-10",
} as const;

type SpinnerProps = {
  className?: string;
  /** Screen-reader text; keep it specific ("Loading users"). */
  label?: string;
  size?: keyof typeof sizes;
};

/** Accessible loading indicator (announces `label` to assistive tech). */
export function Spinner({ className, label = "Loading", size = "md" }: SpinnerProps) {
  return (
    <span
      role="status"
      className={cn("inline-flex items-center justify-center", className)}
    >
      <Loader2
        aria-hidden="true"
        className={cn("animate-spin text-muted-foreground", sizes[size])}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
