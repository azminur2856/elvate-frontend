"use client";

import { initials, mediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** Display sizes; the API path already asks for a matching picture size (xs 64, sm 128, md 320 px). */
const SIZES = {
  xs: "size-8 text-xs",
  sm: "size-10 text-sm",
  md: "size-32 text-3xl",
} as const;

export type UserAvatarSize = keyof typeof SIZES;

/**
 * A person's photo (FE-28): `avatarUrl` is the API path (BE-28), loaded
 * through the same-origin proxy; initials when there is none or it fails to load.
 */
export function UserAvatar({
  name,
  avatarUrl,
  size = "sm",
  className,
}: {
  name: string | null | undefined;
  avatarUrl: string | null | undefined;
  size?: UserAvatarSize;
  className?: string;
}) {
  const src = mediaSrc(avatarUrl);
  return (
    <Avatar className={cn(SIZES[size], className)}>
      {src ? <AvatarImage src={src} alt="" className="object-cover" /> : null}
      <AvatarFallback className="text-[length:inherit]">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
