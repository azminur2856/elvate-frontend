"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ActionButtonProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

/**
 * The tool's primary action. Icon-only (with tooltip + aria-label) in the
 * desktop middle column, icon + visible label when stacked on small screens.
 */
export function ActionButton({
  label,
  icon: Icon,
  onClick,
  loading,
  disabled,
}: ActionButtonProps) {
  return (
    <>
      <Button
        size="lg"
        className="w-full lg:hidden"
        onClick={onClick}
        loading={loading}
        disabled={disabled}
      >
        {!loading ? <Icon aria-hidden="true" /> : null}
        {label}
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-lg"
            className="hidden size-14 rounded-full shadow-lg lg:inline-flex [&_svg:not([class*='size-'])]:size-6"
            aria-label={label}
            onClick={onClick}
            loading={loading}
            disabled={disabled}
          >
            {!loading ? <Icon aria-hidden="true" /> : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </>
  );
}
