"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Product search is not implemented yet: visible, read-only and explained.
 * `readOnly` (not `disabled`) keeps the field focusable so the tooltip is
 * reachable by keyboard and the "coming soon" note is announced.
 */
export function SearchInput({ className }: { className?: string }) {
  return (
    <form
      role="search"
      className={cn("relative items-center", className)}
      onSubmit={(e) => e.preventDefault()}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Input
            type="search"
            aria-label="Search products"
            aria-disabled="true"
            aria-describedby="search-coming-soon"
            placeholder="Search"
            readOnly
            className="h-9 w-40 cursor-not-allowed pl-8 opacity-70 md:w-48"
          />
        </TooltipTrigger>
        <TooltipContent id="search-coming-soon">Search is coming soon</TooltipContent>
      </Tooltip>
    </form>
  );
}
