"use client";

import Link from "next/link";
import type { Session } from "@/lib/session";
import { Role } from "@/lib/enums/role.enum";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CartButton } from "./CartButton";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { SearchInput } from "./SearchInput";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { getNavGroups } from "./nav-config";

type Props = {
  className?: string;
  session: Session | null;
};

export default function NavbarClient({ className, session }: Props) {
  const isAdmin = session?.user?.role === Role.ADMIN;
  const groups = getNavGroups(isAdmin);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[var(--navbar-h)] border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        // When a dialog locks page scroll, Radix pads <body> by the scrollbar
        // width; mirror that here so the fixed header doesn't jump.
        "pr-[var(--removed-body-scroll-bar-size,0px)]",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <MobileNav
          groups={groups}
          session={session}
          isAdmin={isAdmin}
          className="lg:hidden"
        />

        <Link
          href="/"
          className="shrink-0 font-heading text-xl font-bold italic tracking-tight"
        >
          Elvate
        </Link>

        <DesktopNav groups={groups} className="mx-auto hidden lg:flex" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
          <SearchInput className="hidden md:flex" />
          <CartButton />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/shop">Shop</Link>
          </Button>
          <ThemeToggle />
          {session ? (
            <UserMenu session={session} isAdmin={isAdmin} />
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
