"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import type { Session } from "@/lib/session";
import { useLogout } from "@/hooks/useLogout";
import { getUserMenuItems } from "@/components/navbar/nav-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const IMAGEKIT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

export function profileImageUrl(user: Session["user"]): string | undefined {
  if (!IMAGEKIT || !user.profileImage) return undefined;
  if (user.profileImage === "profile.png") {
    return `${IMAGEKIT}/user_profile_image/${user.profileImage}`;
  }
  return `${IMAGEKIT}/user_profile_image/user_${user.id}/${user.profileImage}`;
}

export function initials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function UserMenu({
  session,
  isAdmin,
}: {
  session: Session;
  isAdmin: boolean;
}) {
  const { logout, loading } = useLogout();
  const items = getUserMenuItems(isAdmin);
  const { user } = session;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={`Account menu for ${user.name}`}
        >
          <Avatar className="size-8">
            <AvatarImage src={profileImageUrl(user)} alt="" />
            <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={loading}
          onSelect={(e) => {
            e.preventDefault();
            void logout();
          }}
        >
          <LogOut aria-hidden="true" />
          {loading ? "Signing out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
