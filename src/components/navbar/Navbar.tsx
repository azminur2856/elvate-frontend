// components/Navbar.tsx
import { getSession } from "@/lib/session";
import NavbarClient from "./NavbarClient";

export default async function Navbar({ className }: { className?: string }) {
  const session = await getSession(); // checks if user logged in
  return <NavbarClient className={className} session={session} />;
}
