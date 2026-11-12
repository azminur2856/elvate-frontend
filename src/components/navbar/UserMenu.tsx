"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import type { SessionUser } from "@/lib/session";
import { useLogout } from "@/hooks/useLogout";
import { getUserMenuItems, type NavRole } from "@/components/navbar/nav-config";
import { UserAvatar } from "@/components/shared/UserAvatar";
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

export function profileImageUrl(user: SessionUser): string | undefined {
  if (!IMAGEKIT || !user.profileImage) return undefined;
  if (user.profileImage === "profile.png") {
    return `${IMAGEKIT}/user_profile_image/${user.profileImage}`;
  }
  return `${IMAGEKIT}/user_profile_image/user_${user.id}/${user.profileImage}`;
}

export { initials } from "@/lib/media";

export function UserMenu({
  user,
  role,
}: {
  user: SessionUser;
  role: NavRole;
}) {
  const { logout, loading } = useLogout();
  const items = getUserMenuItems(role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={`Account menu for ${user.name}`}
        >
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} legacySrc={profileImageUrl(user)} size="xs" />
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
