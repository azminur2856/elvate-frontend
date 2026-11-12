"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, FilterX, SlidersHorizontal, X } from "lucide-react";
import type { ProductFilters } from "@/types/commerce";
import { countActiveFilters, DEFAULT_SORT, SORT_OPTIONS, type CatalogParams } from "@/lib/catalog-url";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EmptyState } from "../EmptyState";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogProvider, useCatalog } from "./CatalogContext";

type Chip = { key: string; label: string; remove: Partial<CatalogParams> };

function activeChips(p: CatalogParams): Chip[] {
  const chips: Chip[] = [];
  if (p.q) chips.push({ key: "q", label: `“${p.q}”`, remove: { q: undefined } });
  if (p.minPrice !== undefined || p.maxPrice !== undefined) {
    const label =
      p.minPrice !== undefined && p.maxPrice !== undefined
        ? `${formatBDT(p.minPrice)} – ${formatBDT(p.maxPrice)}`
        : p.minPrice !== undefined
          ? `From ${formatBDT(p.minPrice)}`
          : `Up to ${formatBDT(p.maxPrice)}`;
    chips.push({ key: "price", label, remove: { minPrice: undefined, maxPrice: undefined } });
  }
  p.sizes?.forEach((s) =>
    chips.push({ key: `size-${s}`, label: `Size ${s}`, remove: { sizes: p.sizes!.filter((x) => x !== s) } })
  );
  p.colors?.forEach((c) =>
    chips.push({ key: `color-${c}`, label: c, remove: { colors: p.colors!.filter((x) => x !== c) } })
  );
  if (p.brand) chips.push({ key: "brand", label: p.brand, remove: { brand: undefined } });
  if (p.onSale) chips.push({ key: "sale", label: "On sale", remove: { onSale: undefined } });
  if (p.inStock) chips.push({ key: "stock", label: "In stock", remove: { inStock: undefined } });
  if (p.featured) chips.push({ key: "featured", label: "Featured", remove: { featured: undefined } });
  if (p.newArrival) chips.push({ key: "new", label: "New arrivals", remove: { newArrival: undefined } });
  return chips.map((c) => ({
    ...c,
    // An emptied list must become undefined so it leaves the URL.
    remove: Object.fromEntries(
      Object.entries(c.remove).map(([k, v]) => [k, Array.isArray(v) && v.length === 0 ? undefined : v])
    ) as Partial<CatalogParams>,
  }));
}

function ActiveFilterChips() {
  const { params, update, clearAll } = useCatalog();
  const chips = activeChips(params);
  if (!chips.length) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="sr-only">Active filters:</span>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => update(c.remove)}
          aria-label={`Remove filter ${c.label}`}
          className="inline-flex items-center gap-1 rounded-full border bg-secondary px-3 py-1 text-sm text-secondary-foreground hover:bg-accent"
        >
          {c.label}
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ))}
      {chips.length > 1 ? (
        <Button variant="link" size="sm" className="h-auto px-1 text-link" onClick={clearAll}>
          Clear all
        </Button>
      ) : null}
    </div>
  );
}

function SortSelect() {
  const { params, update } = useCatalog();
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="catalog-sort" className="whitespace-nowrap text-sm text-muted-foreground">
        Sort by
      </Label>
      <Select value={params.sort ?? DEFAULT_SORT} onValueChange={(v) => update({ sort: v as CatalogParams["sort"] })}>
        <SelectTrigger id="catalog-sort" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

function CatalogPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const { params, hrefFor, update } = useCatalog();
  if (totalPages <= 1) return null;

  const go = (n: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks open a new tab; otherwise navigate in a transition.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    update({ page: n }, { keepPage: true, scroll: true });
  };
  const href = (n: number) => hrefFor({ ...params, page: n });

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Button asChild variant="ghost" size="sm">
          <Link href={href(page - 1)} onClick={go(page - 1)} rel="prev">
            <ChevronLeft aria-hidden="true" />
            Previous
          </Link>
        </Button>
      ) : null}
      {pageWindow(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Button key={p} asChild variant={p === page ? "default" : "ghost"} size="icon-sm">
            <Link href={href(p)} onClick={go(p)} aria-current={p === page ? "page" : undefined} aria-label={`Page ${p}`}>
              {p}
            </Link>
          </Button>
        )
      )}
      {page < totalPages ? (
        <Button asChild variant="ghost" size="sm">
          <Link href={href(page + 1)} onClick={go(page + 1)} rel="next">
            Next
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      ) : null}
    </nav>
  );
}

/** Empty results: offers to clear the filters when there are any. */
export function CatalogEmpty({ title = "No products match" }: { title?: string }) {
  const { params, clearAll } = useCatalog();
  const filtered = countActiveFilters(params) > 0;
  return (
    <EmptyState
      title={filtered ? title : "Nothing here yet"}
      description={
        filtered ? "Try removing a filter or widening the price range." : "New products are added regularly. Check back soon."
      }
      action={
        filtered ? (
          <Button variant="outline" onClick={clearAll}>
            <FilterX aria-hidden="true" />
            Clear filters
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/shop">Back to the shop</Link>
          </Button>
        )
      }
    />
  );
}

function Layout({
  facets,
  total,
  page,
  totalPages,
  children,
}: {
  facets: ProductFilters | null;
  total: number | null;
  page: number;
  totalPages: number;
  children: React.ReactNode;
}) {
  const { params, isPending, resultsRef } = useCatalog();
  const active = countActiveFilters(params);
  const countText = total === null ? "" : `${total} ${total === 1 ? "product" : "products"}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-[calc(var(--navbar-h)+1.5rem)] max-h-[calc(100svh-var(--navbar-h)-3rem)] overflow-y-auto pb-6 pr-2 [scrollbar-width:thin]">
          <h2 className="mb-5 text-lg font-semibold">Filters</h2>
          <CatalogFilters facets={facets} />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal aria-hidden="true" />
                  Filters
                  {active > 0 ? (
                    <Badge className="ml-0.5 h-5 min-w-5 px-1.5">
                      {active}
                      <span className="sr-only"> active</span>
                    </Badge>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[min(22rem,90vw)] flex-col gap-0 p-0">
                <SheetHeader className="border-b">
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Results update as you choose.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <CatalogFilters facets={facets} />
                </div>
                <SheetFooter className="border-t">
                  <SheetClose asChild>
                    <Button className="w-full" loading={isPending}>
                      {isPending ? "Updating…" : `Show ${countText || "results"}`}
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isPending ? "Updating results…" : countText}
            </p>
          </div>
          <SortSelect />
        </div>

        <ActiveFilterChips />

        <div
          ref={resultsRef}
          aria-busy={isPending}
          className={cn(
            "mt-6 scroll-mt-[calc(var(--navbar-h)+1rem)] transition-opacity motion-reduce:transition-none",
            isPending && "pointer-events-none opacity-60"
          )}
        >
          {children}
        </div>

        <CatalogPagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}

type CatalogShellProps = {
  params: CatalogParams;
  facets: ProductFilters | null;
  /** null when the products request failed. */
  total: number | null;
  page: number;
  totalPages: number;
  /** Server-rendered results (grid, empty state or error). */
  children: React.ReactNode;
};

/** Client frame around the server-rendered results: filters, sort, chips, pagination. */
export function CatalogShell({ params, ...rest }: CatalogShellProps) {
  return (
    <CatalogProvider params={params}>
      <Layout {...rest} />
    </CatalogProvider>
  );
}
