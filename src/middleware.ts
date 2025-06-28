// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";
import { Role } from "./lib/enums/role.enum"; // Import your Role enum

// This is a utility for easy matching of auth-free routes
const PUBLIC_ROUTES = ["/login", "/signup"];

export default async function middleware(req: NextRequest) {
  // Get the pathname for easy matching
  const { pathname } = req.nextUrl;

  // Get session (returns null if not logged in)
  const session = await getSession();

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (session) {
      // If logged in, redirect away from login/signup
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    // If not logged in, allow to proceed
    return NextResponse.next();
  }

  // Always require login for protected routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Check if this is an admin-only route
  const isAdminRoute = pathname.startsWith("/admin");

  // If it's an admin route, require admin role
  if (isAdminRoute) {
    if (!session.user || session.user.role !== Role.ADMIN) {
      // Option 1: Redirect to homepage or error
      //return NextResponse.redirect(new URL("/", req.nextUrl));
      // Option 2: Return a 403 Forbidden page
      //return new NextResponse("Forbidden", { status: 403 });
      // Option 3: Redirect to a custom error page
      return NextResponse.redirect(new URL("/403", req.nextUrl));
    }
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
    "/dashboard",
    "/subscription/:path*",
    "/activate/:path*",
    "/payment/:path*",
    // Only protect subpaths of /digitalServices, not the base path itself
    "/digitalServices/(.+)",
    // Admin-only routes
    "/admin/:path*",
  ],
};
