import { Badge } from "@/components/ui/badge";

/** Stock at or below this counts as "low" in admin lists. */
export const LOW_STOCK = 5;

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge variant="destructive">Out of stock</Badge>;
  if (stock <= LOW_STOCK) return <Badge variant="warning">Low: {stock}</Badge>;
  return <span className="tabular-nums">{stock}</span>;
}
