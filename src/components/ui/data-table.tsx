"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  /** Renders monospaced, tabular digits, right-aligned. */
  numeric?: boolean;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  loadingLabel?: string;
  emptyMessage?: React.ReactNode;
  /** Visually hidden table caption for assistive tech. */
  caption?: string;
  className?: string;
};

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * Data table with horizontal scrolling, an accessible loading state and a
 * single empty-row that always spans the real column count.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  loadingLabel = "Loading",
  emptyMessage = "No results.",
  caption,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "relative overflow-x-auto rounded-xl border border-border bg-card",
        className
      )}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <Spinner size="lg" label={loadingLabel} />
        </div>
      ) : null}
      <Table>
        {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "whitespace-nowrap",
                  alignClass[col.align ?? (col.numeric ? "right" : "left")],
                  col.className
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-muted-foreground"
              >
                {loading ? "" : emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={rowKey(row, index)}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      alignClass[col.align ?? (col.numeric ? "right" : "left")],
                      col.numeric && "font-mono tabular-nums",
                      col.className
                    )}
                  >
                    {col.cell(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
