// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";
import { Role, STAFF_ADMIN_PATHS } from "./lib/enums/role.enum";
import { loginHref, safeNextPath } from "./lib/redirect";

// Pages a logged-in user should not see (they are sent on to `?next` or "/").
const PUBLIC_ROUTES = ["/login", "/signup"];

const startsWithSegment = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

// Backend proxy headers (see API-CONTRACT.md, SEC-06 / FSEC-06). The backend
// trusts the client IP only when the shared secret matches, so callers that
// hit the Render URL directly can't pick their own rate-limit key.
const PROXY_SECRET_HEADER = "x-elvate-proxy-secret";
const CLIENT_IP_HEADER = "x-elvate-client-ip";

/** Vercel sets both headers itself and overwrites values sent by the client. */
function clientIp(req: NextRequest): string | null {
  const realIp = req.headers.get("x-real-ip")?.trim();
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return realIp || forwarded || null;
}

/**
 * `/api/backend/*` is rewritten to the backend by next.config.ts. Add the
 * proxy headers and pass everything else (cookies, body, redirects) through
 * untouched.
 */
function forwardToBackend(req: NextRequest) {
  const headers = new Headers(req.headers);
  // Never forward copies the browser sent itself.
  headers.delete(PROXY_SECRET_HEADER);
  headers.delete(CLIENT_IP_HEADER);
  const secret = process.env.PROXY_SHARED_SECRET;
  const ip = clientIp(req);
  if (secret && ip) {
    headers.set(PROXY_SECRET_HEADER, secret);
    headers.set(CLIENT_IP_HEADER, ip);
  }
  return NextResponse.next({ request: { headers } });
}

export default async function middleware(req: NextRequest) {
  const { pathname, search, searchParams } = req.nextUrl;

  if (startsWithSegment(pathname, "/api/backend")) return forwardToBackend(req);

  // Get session (returns null if not logged in)
  const session = await getSession();

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (session) {
      // Already logged in: continue to where the user was heading.
      const next = safeNextPath(searchParams.get("next"));
      return NextResponse.redirect(new URL(next, req.nextUrl));
    }
    return NextResponse.next();
  }

  // Always require login for protected routes; remember where the user was going.
  if (!session) {
    return NextResponse.redirect(new URL(loginHref(`${pathname}${search}`), req.nextUrl));
  }

  const role = session.user?.role;

  // Admin area: ADMIN everywhere; STAFF only orders, products (incl. categories) and reviews.
  if (startsWithSegment(pathname, "/admin")) {
    const staffAllowed =
      role === Role.STAFF && STAFF_ADMIN_PATHS.some((p) => startsWithSegment(pathname, p));
    if (role !== Role.ADMIN && !staffAllowed) {
      return NextResponse.redirect(new URL("/403", req.nextUrl));
    }
  }

  // Delivery area: delivery men only. Admins and staff manage deliveries
  // under /admin/deliveries but never perform them (FE-29 / BE-29).
  if (startsWithSegment(pathname, "/delivery") && role !== Role.DELIVERY_MAN) {
    return NextResponse.redirect(new URL("/403", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Backend proxy: adds the shared-secret and client IP headers
    "/api/backend/:path*",
    // Not available if user logged in
    "/login",
    "/signup",
    // Protected user routes
    "/profile",
    "/activity",
    "/settings",
    "/subscription/:path*",
    "/payment/:path*",
    "/checkout",
    "/orders/:path*",
    // Only protect subpaths of /digitalServices, not the base path itself
    "/digitalServices/(.+)",
    // DELIVERY_MAN only
    "/delivery/:path*",
    // Admin-only routes
    "/admin/:path*",
  ],
};
