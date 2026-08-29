"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Product search is not implemented yet: visible, disabled, explained. */
export function SearchInput({ className }: { className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <form
          role="search"
          className={cn("relative items-center", className)}
          onSubmit={(e) => e.preventDefault()}
        >
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search products"
            placeholder="Search"
            disabled
            className="h-9 w-40 pl-8 md:w-48"
          />
        </form>
      </TooltipTrigger>
      <TooltipContent>Search is coming soon</TooltipContent>
    </Tooltip>
  );
}
