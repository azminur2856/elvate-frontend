// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";
import { Role } from "./lib/enums/role.enum";
import { loginHref, safeNextPath } from "./lib/redirect";

// Pages a logged-in user should not see (they are sent on to `?next` or "/").
const PUBLIC_ROUTES = ["/login", "/signup"];

const startsWithSegment = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export default async function middleware(req: NextRequest) {
  const { pathname, search, searchParams } = req.nextUrl;

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

  // Admin-only routes
  if (startsWithSegment(pathname, "/admin") && role !== Role.ADMIN) {
    return NextResponse.redirect(new URL("/403", req.nextUrl));
  }

  // Delivery area: delivery men, and admins may view it
  if (
    startsWithSegment(pathname, "/delivery") &&
    role !== Role.DELIVERY_MAN &&
    role !== Role.ADMIN
  ) {
    return NextResponse.redirect(new URL("/403", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
    // DELIVERY_MAN (or ADMIN)
    "/delivery/:path*",
    // Admin-only routes
    "/admin/:path*",
  ],
};
