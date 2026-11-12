/**
 * Server-side fetch helpers for the PUBLIC catalog endpoints.
 *
 * Use these only from server components / route handlers (page.tsx,
 * generateMetadata, sitemap.ts). They call `process.env.BACKEND_URL` directly
 * so catalog pages render on the server (SEO, generateMetadata) and are cached
 * with ISR (`revalidate: 60`). Browser code keeps using `lib/authAxios.ts`
 * through the `/api/backend` proxy.
 *
 * Every helper resolves to a `CatalogResult` and never throws: the Render
 * free tier sleeps, so pages must be able to render a graceful fallback.
 */
import type {
  Category,
  CategoryDetail,
  OffersResponse,
  Paginated,
  ProductCard,
  ProductDetail,
  ProductFilters,
  ProductQuery,
  ProductReviewsPage,
  Review,
} from "@/types/commerce";

const DEFAULT_REVALIDATE = 60;
const DEFAULT_TIMEOUT_MS = 10_000;

export type CatalogResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number | null; message: string };

type FetchOptions = {
  /** Seconds before the cached response is refreshed (ISR). */
  revalidate?: number;
  /** Abort after this many ms so a sleeping backend can't hang the render. */
  timeoutMs?: number;
};

function backendBase(): string {
  return (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");
}

/** Low-level GET against the backend. `path` starts with "/". */
export async function catalogFetch<T>(
  path: string,
  { revalidate = DEFAULT_REVALIDATE, timeoutMs = DEFAULT_TIMEOUT_MS }: FetchOptions = {}
): Promise<CatalogResult<T>> {
  try {
    const res = await fetch(`${backendBase()}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      let message = res.statusText || `Request failed (${res.status})`;
      try {
        const body = (await res.json()) as { message?: string | string[] };
        if (Array.isArray(body.message)) message = body.message.join(", ");
        else if (typeof body.message === "string" && body.message) message = body.message;
      } catch {
        // body was not JSON; keep statusText
      }
      return { ok: false, status: res.status, message };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    return {
      ok: false,
      status: null,
      message: err instanceof Error ? err.message : "The shop is temporarily unavailable.",
    };
  }
}

/**
 * Build a query string ("?a=1&b=x") from a flat object. Skips undefined,
 * null, "", NaN, `false` and empty arrays; arrays are sent as csv.
 */
export function toQueryString(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    if (Array.isArray(value)) {
      if (value.length) sp.set(key, value.join(","));
      continue;
    }
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

const seg = (s: string) => encodeURIComponent(s);

// ---------------------------------------------------------------------------
// Categories (BE-10)
// ---------------------------------------------------------------------------

/** `GET /categories`: tree with roots men / women / children. */
export function getCategoryTree() {
  return catalogFetch<Category[]>("/categories");
}

/** `GET /categories/:slug`: category with children + breadcrumb. */
export function getCategory(slug: string) {
  return catalogFetch<CategoryDetail>(`/categories/${seg(slug)}`);
}

// ---------------------------------------------------------------------------
// Products (BE-11)
// ---------------------------------------------------------------------------

/** `GET /products`: paginated, active products only. */
export function getProducts(query: ProductQuery = {}, options?: FetchOptions) {
  return catalogFetch<Paginated<ProductCard>>(`/products${toQueryString(query)}`, options);
}

/** `GET /products/filters`: facet values for the listing filters. */
export function getProductFilters(category?: string) {
  return catalogFetch<ProductFilters>(`/products/filters${toQueryString({ category })}`);
}

/** `GET /products/:slug`. `status: 404` means unknown or inactive slug. */
export function getProduct(slug: string) {
  return catalogFetch<ProductDetail>(`/products/${seg(slug)}`);
}

/** `GET /products/:slug/related` */
export function getRelatedProducts(slug: string, limit = 8) {
  return catalogFetch<ProductCard[]>(`/products/${seg(slug)}/related${toQueryString({ limit })}`);
}

// ---------------------------------------------------------------------------
// Reviews (BE-19) + offers (BE-18)
// ---------------------------------------------------------------------------

/** `GET /products/:slug/reviews`: approved reviews + rating summary. */
export function getProductReviews(slug: string, page = 1, pageSize = 5) {
  return catalogFetch<ProductReviewsPage>(
    `/products/${seg(slug)}/reviews${toQueryString({ page, pageSize })}`
  );
}

/** `GET /reviews/featured`: approved, rating ≥ 4, with comment. */
export function getFeaturedReviews(limit = 10) {
  return catalogFetch<Review[]>(`/reviews/featured${toQueryString({ limit })}`);
}

/** `GET /offers`: live flash sales + public coupons. Short cache: sales start/end. */
export function getOffers() {
  return catalogFetch<OffersResponse>("/offers", { revalidate: 30 });
}
