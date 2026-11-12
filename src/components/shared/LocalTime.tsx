"use client";

import { useEffect, useState } from "react";
import { formatDate, formatDateTime } from "@/lib/format";

/**
 * A date in the viewer's locale + time zone. The server can't know either,
 * so it renders the ISO day first and the local text after mount (no
 * hydration mismatch).
 */
export function LocalTime({
  value,
  mode = "date",
  className,
}: {
  value: string | null | undefined;
  mode?: "date" | "datetime";
  className?: string;
}) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    setText(mode === "date" ? formatDate(value) : formatDateTime(value));
  }, [value, mode]);
  if (!value) return <span className={className}>—</span>;
  return (
    <time dateTime={value} className={className}>
      {text ?? value.slice(0, 10)}
    </time>
  );
}
