import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";

export default async function middleware(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  NextResponse.next();
}

export const config = {
  matcher: [
    "/profile",
    "/dashboard",
    "/subscription/:path*",
    "/payment/:path*",
    // Only protect subpaths of /digitalServices, not the base path itself
    "/digitalServices/(.+)",
  ],
};
