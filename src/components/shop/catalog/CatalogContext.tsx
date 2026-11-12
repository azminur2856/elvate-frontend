"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { serializeCatalogParams, type CatalogParams } from "@/lib/catalog-url";

type UpdateOptions = {
  /** Keep the current page (default: any filter change goes back to page 1). */
  keepPage?: boolean;
  /** Scroll to the top of the results (pagination). */
  scroll?: boolean;
};

type CatalogContextValue = {
  /** Current filter state, parsed on the server from the URL. */
  params: CatalogParams;
  /** Merge a patch into the URL state and navigate (inside a transition). */
  update: (patch: Partial<CatalogParams>, options?: UpdateOptions) => void;
  /** Remove every filter (search text and sort are kept). */
  clearAll: () => void;
  /** href for a given state (used by pagination links). */
  hrefFor: (next: CatalogParams) => string;
  /** True while the server renders the new results. */
  isPending: boolean;
  resultsRef: React.RefObject<HTMLDivElement | null>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}

/**
 * Filter state lives in the URL. Changing a filter pushes a new URL inside a
 * transition: the current results stay visible (dimmed) until the server has
 * rendered the new ones, and the filter controls keep their focus.
 */
export function CatalogProvider({ params, children }: { params: CatalogParams; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const hrefFor = useCallback(
    (next: CatalogParams) => {
      const qs = serializeCatalogParams(next);
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname]
  );

  const navigate = useCallback(
    (next: CatalogParams, scroll = false) => {
      startTransition(() => router.push(hrefFor(next), { scroll: false }));
      if (scroll) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resultsRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      }
    },
    [hrefFor, router]
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      params,
      isPending,
      resultsRef,
      hrefFor,
      update: (patch, options) =>
        navigate(
          { ...params, ...patch, page: options?.keepPage ? (patch.page ?? params.page) : patch.page },
          options?.scroll
        ),
      clearAll: () => navigate({ q: params.q, sort: params.sort }),
    }),
    [params, isPending, hrefFor, navigate]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
