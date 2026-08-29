import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  ok: boolean;
  okLabel?: string;
  noLabel?: string;
};

/** Boolean state as icon + visible text (never colour alone). */
export function StatusBadge({
  ok,
  okLabel = "Yes",
  noLabel = "No",
}: StatusBadgeProps) {
  return ok ? (
    <Badge variant="success">
      <Check aria-hidden="true" />
      {okLabel}
    </Badge>
  ) : (
    <Badge variant="destructive">
      <X aria-hidden="true" />
      {noLabel}
    </Badge>
  );
}
