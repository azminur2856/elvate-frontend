"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/lib/authAxios";
import { isShopManager } from "@/lib/enums/role.enum";
import { REVIEWS_CHANGED_EVENT } from "@/lib/events";
import type { Session } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loginHref } from "@/lib/redirect";
import { CartButton } from "./CartButton";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { SearchInput } from "./SearchInput";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { applyBadges, getNavGroups } from "./nav-config";

type Props = {
  className?: string;
  session: Session | null;
};


/** Pending review count for ADMIN / STAFF (badge on "Reviews"). */
function usePendingReviews(enabled: boolean): number | undefined {
  const [count, setCount] = useState<number>();
  useEffect(() => {
    if (!enabled) return;
    const load = () =>
      api
        .get<{ total: number }>("/admin/reviews", { params: { status: "PENDING", page: 1, pageSize: 1 } })
        .then((res) => setCount(res.data.total))
        .catch(() => setCount(undefined));
    void load();
    window.addEventListener(REVIEWS_CHANGED_EVENT, load);
    return () => window.removeEventListener(REVIEWS_CHANGED_EVENT, load);
  }, [enabled]);
  return count;
}

export default function NavbarClient({ className, session }: Props) {
  const pathname = usePathname();
  const role = session?.user?.role ?? null;
  const pendingReviews = usePendingReviews(isShopManager(role));
  const groups = applyBadges(getNavGroups(role), { "/admin/reviews": pendingReviews });

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
          role={role}
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
          <Suspense fallback={<div className="hidden h-9 w-52 md:block lg:w-56" />}>
            <SearchInput className="hidden md:flex" />
          </Suspense>
          <CartButton />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/shop">Shop</Link>
          </Button>
          <ThemeToggle />
          {session ? (
            <UserMenu session={session} role={role} />
          ) : (
            <Button asChild size="sm">
              <Link href={loginHref(pathname)}>Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
