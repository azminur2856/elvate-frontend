"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import api from "@/lib/authAxios";
import { productHref } from "@/lib/catalog-url";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Paginated, ProductCard } from "@/types/commerce";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/shop/ProductImage";

const MIN_CHARS = 2;

type SearchInputProps = {
  className?: string;
  /** Show the top-5 product suggestions while typing. */
  suggestions?: boolean;
  /** Called after navigating (e.g. to close the mobile menu). */
  onNavigate?: () => void;
  inputClassName?: string;
};

/**
 * Product search. Submitting goes to /search?q=…; while typing, a combobox
 * lists up to five matching products (↑ / ↓ to move, Enter to open, Esc to close).
 */
export function SearchInput({ className, suggestions = true, onNavigate, inputClassName }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = pathname === "/search" ? (searchParams.get("q") ?? "") : "";
  const listId = useId();
  const [value, setValue] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [results, setResults] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(false);
  const blurTimer = useRef<number | undefined>(undefined);
  const debounced = useDebounce(value.trim(), 250);

  // Follow the URL (back button, search page chips).
  useEffect(() => setValue(urlQuery), [urlQuery]);

  useEffect(() => {
    if (!suggestions || debounced.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get<Paginated<ProductCard>>("/products", { params: { q: debounced, pageSize: 5 } })
      .then((res) => {
        if (cancelled) return;
        setResults(res.data.items ?? []);
        setActive(-1);
      })
      .catch(() => !cancelled && setResults([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced, suggestions]);

  const query = value.trim();
  const showList = suggestions && open && query.length >= MIN_CHARS;
  // Options: the products, then "Search for …".
  const optionCount = results.length + 1;

  const go = (href: string) => {
    setOpen(false);
    setActive(-1);
    router.push(href);
    onNavigate?.();
  };
  const searchHref = query ? `/search?q=${encodeURIComponent(query)}` : "/search";

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) {
      if (e.key === "ArrowDown" && query.length >= MIN_CHARS) setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % optionCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? optionCount - 1 : a - 1));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    } else if (e.key === "Enter" && active >= 0 && active < results.length) {
      e.preventDefault();
      go(productHref(results[active].slug));
    }
  };

  return (
    <form
      role="search"
      className={cn("relative items-center", className)}
      onSubmit={(e) => {
        e.preventDefault();
        go(searchHref);
      }}
    >
      <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          window.clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={onKeyDown}
        placeholder="Search products"
        aria-label="Search products"
        autoComplete="off"
        enterKeyHint="search"
        maxLength={100}
        role={suggestions ? "combobox" : undefined}
        aria-autocomplete={suggestions ? "list" : undefined}
        aria-expanded={suggestions ? showList : undefined}
        aria-controls={suggestions ? listId : undefined}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        className={cn("h-9 w-44 pl-8 md:w-52 lg:w-56", inputClassName)}
      />
      {suggestions ? (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg",
            !showList && "hidden"
          )}
        >
          <ul id={listId} role="listbox" aria-label="Product suggestions" className="max-h-96 overflow-y-auto p-1">
            {results.map((p, i) => (
              <li
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={active === i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(productHref(p.slug))}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2",
                  active === i && "bg-accent text-accent-foreground"
                )}
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-md border">
                  <ProductImage src={p.mainImage} alt="" sizes="40px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.category.name}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{formatBDT(p.effectivePrice)}</span>
              </li>
            ))}
            <li
              id={`${listId}-${results.length}`}
              role="option"
              aria-selected={active === results.length}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(searchHref)}
              onMouseEnter={() => setActive(results.length)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm",
                active === results.length && "bg-accent text-accent-foreground"
              )}
            >
              {loading ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <Search aria-hidden="true" className="size-4 text-muted-foreground" />
              )}
              <span className="truncate">
                {loading && !results.length ? "Searching… " : ""}See all results for “{query}”
              </span>
            </li>
          </ul>
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {showList && !loading ? `${results.length} ${results.length === 1 ? "suggestion" : "suggestions"}` : ""}
      </span>
    </form>
  );
}
