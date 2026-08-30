"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { isActivePath, type NavGroup, type NavLink } from "./nav-config";

function LinkItem({ item, active }: { item: NavLink; active: boolean }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
          active && "bg-accent/70 font-medium"
        )}
      >
        <span className="block leading-tight">{item.label}</span>
        {item.description ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {item.description}
          </span>
        ) : null}
      </Link>
    </NavigationMenuLink>
  );
}

export function DesktopNav({
  groups,
  className,
}: {
  groups: NavGroup[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    // viewport={false}: each panel drops directly under its own trigger
    // instead of into one shared viewport anchored to the menu's left edge.
    <NavigationMenu className={className} aria-label="Primary" viewport={false}>
      <NavigationMenuList>
        {groups.map((group) => {
          const active = isActivePath(pathname, group.href);
          const hasChildren = Boolean(group.items?.length || group.sections?.length);

          if (!hasChildren) {
            return (
              <NavigationMenuItem key={group.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={group.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      active && "bg-accent/70 font-semibold"
                    )}
                  >
                    {group.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={group.href}>
              <NavigationMenuTrigger
                className={cn(active && "bg-accent/70 font-semibold")}
                data-active={active || undefined}
              >
                {group.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent
                className={cn(group.sections && "md:left-auto md:right-0")}
              >
                {group.sections ? (
                  <div className="grid w-[min(42rem,calc(100vw-2rem))] grid-cols-3 gap-4 p-4">
                    {group.sections.map((section) => (
                      <div key={section.label}>
                        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {section.label}
                        </p>
                        <ul className="grid gap-0.5">
                          {section.items.map((item) => (
                            <li key={item.href}>
                              <LinkItem
                                item={item}
                                active={isActivePath(pathname, item.href)}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="grid w-72 gap-0.5 p-2">
                    <li>
                      <LinkItem
                        item={{ label: `All ${group.label.toLowerCase()}`, href: group.href }}
                        active={pathname === group.href}
                      />
                    </li>
                    {group.items!.map((item) => (
                      <li key={item.href}>
                        <LinkItem item={item} active={isActivePath(pathname, item.href)} />
                      </li>
                    ))}
                  </ul>
                )}
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
