import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { Role } from "@/lib/enums/role.enum";

/**
 * Where a user lands after logging in when no `?next=` was given.
 * The login endpoints only return `{ success: true }`, so the role is read
 * from the freshly set session cookie here. STAFF go straight to the order
 * queue; everyone else to the home page.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  const target = session?.user?.role === Role.STAFF ? "/admin/orders/view" : "/";
  return NextResponse.redirect(new URL(target, req.nextUrl));
}
