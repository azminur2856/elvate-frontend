import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type FormMessageProps = {
  variant: "success" | "error" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

/**
 * Page/form-level outcome message. The variant is set from explicit state
 * (never inferred from message text), so it is always announced correctly.
 */
export function FormMessage({ variant, title, children, className }: FormMessageProps) {
  const Icon = icons[variant];
  return (
    <Alert
      variant={variant === "error" ? "destructive" : "default"}
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        variant === "success" &&
          "border-success/40 text-success [&>svg]:text-success",
        variant === "info" && "border-border",
        className
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
