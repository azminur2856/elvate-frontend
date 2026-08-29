/**
 * Recharts styling driven by the theme tokens, so every chart follows
 * light/dark automatically. SVG `fill`/`stroke` accept CSS variables.
 */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const axisProps = {
  stroke: "var(--muted-foreground)",
  tick: { fill: "var(--muted-foreground)", fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: "var(--border)" },
} as const;

export const gridProps = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
  vertical: false,
} as const;

export const tooltipProps = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--popover-foreground)",
    fontSize: 13,
  },
  labelStyle: { color: "var(--muted-foreground)" },
  itemStyle: { color: "var(--popover-foreground)" },
  cursor: { fill: "color-mix(in srgb, var(--muted) 60%, transparent)" },
} as const;

export const legendProps = {
  wrapperStyle: { color: "var(--muted-foreground)", fontSize: 13 },
} as const;
