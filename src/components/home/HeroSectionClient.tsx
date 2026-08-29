"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { MovingBorderButton } from "../ui/moving-border";
import { Spotlight } from "../ui/spotlight-new";
import { Role } from "@/lib/enums/role.enum";

type User = {
  id: string;
  name: string;
  role: Role;
  email: string;
  profileImage: string;
};

interface HeroSectionProps {
  user?: User | null;
}

function HeroSectionClient({ user }: HeroSectionProps) {
  let title = "Elevate your digital experience";
  let message =
    "Welcome to Elvate — your all-in-one platform for digital services and smart shopping. Convert PDFs, edit images, remove backgrounds or resize files in a click, and discover quality products delivered to your door.";

  if (user) {
    if (user.role === Role.ADMIN) {
      title = `Welcome back, ${user.name || "Admin"}`;
      message =
        "Open the dashboard to manage users, products and digital services. Elvate's admin tools put you in control of everything.";
    } else {
      title = `Welcome back${user.name ? `, ${user.name}` : ""}`;
      message =
        "Explore powerful digital tools and an exclusive shopping experience, tailored for you.";
    }
  }

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]"
      />
      <div className="hidden dark:block" aria-hidden="true">
        <Spotlight />
      </div>

      <div className="mx-auto flex min-h-[calc(100svh-var(--navbar-h))] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 md:min-h-[38rem]">
        <h1 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl md:text-7xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {message}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <MovingBorderButton as={Link} href="/digitalServices" borderRadius="1.75rem">
            Explore digital services
            <ArrowRight aria-hidden="true" className="size-4" />
          </MovingBorderButton>
          <MovingBorderButton as={Link} href="/shop" borderRadius="1.75rem">
            <ShoppingBag aria-hidden="true" className="size-4" />
            Shop products
          </MovingBorderButton>
        </div>
      </div>
    </section>
  );
}

export default HeroSectionClient;
