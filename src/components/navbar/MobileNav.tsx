"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import type { Session } from "@/lib/session";
import { useLogout } from "@/hooks/useLogout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { loginHref } from "@/lib/redirect";
import { SearchInput } from "./SearchInput";
import { ThemeToggle } from "./ThemeToggle";
import { getUserMenuItems, isActivePath, type NavGroup, type NavLink, type NavRole } from "./nav-config";

function NavItem({ item, active }: { item: NavLink; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
        active && "bg-accent/70 font-medium"
      )}
    >
      {item.label}
      {item.badge ? (
        <span className="min-w-5 rounded-full bg-brand px-1.5 text-center text-xs font-semibold text-brand-foreground tabular-nums">
          {item.badge}
          <span className="sr-only"> {item.badgeLabel ?? "new"}</span>
        </span>
      ) : null}
    </Link>
  );
}

export function MobileNav({
  groups,
  session,
  role,
  className,
}: {
  groups: NavGroup[];
  session: Session | null;
  role: NavRole;
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout, loading } = useLogout();

  // Close the sheet after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          aria-label="Open menu"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-80 flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-heading text-lg italic">Elvate</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>

        <div className="border-b border-border p-3 md:hidden">
          <Suspense fallback={null}>
            <SearchInput
              className="flex"
              inputClassName="w-full md:w-full lg:w-full"
              suggestions={false}
              onNavigate={() => setOpen(false)}
            />
          </Suspense>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto p-3">
          {groups.map((group) => {
            const children = group.sections
              ? group.sections.flatMap((s) => s.items)
              : group.items ?? [];
            return (
              <div key={group.href} className="mb-3">
                <NavItem
                  item={{ label: group.label, href: group.href }}
                  active={isActivePath(pathname, group.href) && !children.some((c) => isActivePath(pathname, c.href))}
                />
                {children.length ? (
                  <ul className="ml-3 mt-0.5 border-l border-border pl-2">
                    {children.map((item) => (
                      <li key={item.href}>
                        <NavItem item={item} active={isActivePath(pathname, item.href)} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}

          <Separator className="my-3" />

          {session ? (
            <div>
              <p className="px-3 text-sm text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{session.user.name}</span>
              </p>
              <ul className="mt-1">
                {getUserMenuItems(role).map((item) => (
                  <li key={item.href}>
                    <NavItem item={item} active={isActivePath(pathname, item.href)} />
                  </li>
                ))}
              </ul>
              <Button
                variant="ghost"
                className="mt-1 w-full justify-start text-destructive hover:text-destructive"
                onClick={() => void logout()}
                loading={loading}
              >
                <LogOut aria-hidden="true" />
                Log out
              </Button>
            </div>
          ) : (
            <Button asChild className="w-full">
              <Link href={loginHref(pathname)}>Log in</Link>
            </Button>
          )}
        </nav>

        <div className="flex items-center justify-between border-t border-border p-3">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
