// components/Navbar.tsx
import { getSession, toSessionUser } from "@/lib/session";
import NavbarClient from "./NavbarClient";

export default async function Navbar({ className }: { className?: string }) {
  // Only the user's display fields reach the browser, never the tokens.
  const user = toSessionUser(await getSession());
  return <NavbarClient className={className} user={user} />;
}
