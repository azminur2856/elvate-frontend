"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  const last = Math.max(totalPages, 1);
  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Page <span className="font-mono tabular-nums">{page}</span> of{" "}
        <span className="font-mono tabular-nums">{last}</span>
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft aria-hidden="true" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= last}
        >
          Next
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
