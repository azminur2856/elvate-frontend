import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { Role } from "@/lib/enums/role.enum";

/** Role-specific landing pages; every other role goes to the home page. */
const LANDING: Partial<Record<Role, string>> = {
  [Role.ADMIN]: "/admin/dashboard",
  [Role.STAFF]: "/admin/orders/view",
  [Role.DELIVERY_MAN]: "/delivery",
};

/**
 * Where a user lands after logging in when no `?next=` was given (password,
 * Google and face login all come here via afterLoginTarget). The login
 * endpoints only return `{ success: true }`, so the role is read from the
 * freshly set session cookie. Admins go to the dashboard, STAFF to the order
 * queue, delivery men to their deliveries, everyone else to the home page.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  const role = session?.user?.role;
  const target = (role && LANDING[role]) || "/";
  return NextResponse.redirect(new URL(target, req.nextUrl));
}
