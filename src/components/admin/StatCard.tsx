import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** 1–5: which chart colour to use as the accent stripe. */
  accent?: 1 | 2 | 3 | 4 | 5;
  className?: string;
};

const accents = {
  1: "border-l-chart-1",
  2: "border-l-chart-2",
  3: "border-l-chart-3",
  4: "border-l-chart-4",
  5: "border-l-chart-5",
} as const;

export function StatCard({ label, value, hint, accent = 1, className }: StatCardProps) {
  return (
    <Card className={cn("border-l-4 py-4", accents[accent], className)}>
      <CardContent className="px-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-3xl font-bold tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
