// components/home/HeroSection.tsx
import Link from "next/link";
import { Button } from "../ui/moving-border";
import { Spotlight } from "../ui/spotlight-new";
import { Role } from "@/lib/enums/role.enum"; // adjust import as needed

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
  let welcomeTitle = "Elevate Your Digital Experience";
  let welcomeMessage =
    "Welcome to Elvate — your all-in-one platform for digital services and smart shopping. Instantly convert PDFs, edit images, remove backgrounds, or resize files with a click. Plus, discover and shop high-quality products delivered right to your door.";

  if (user) {
    if (user.role === Role.ADMIN) {
      welcomeTitle = `Welcome Admin${user.name ? `, ${user.name}` : ""}!`;
      welcomeMessage =
        "Access your dashboard to manage users, products, and digital services. Elvate's admin tools put you in control of everything.";
    } else {
      welcomeTitle = `Welcome${user.name ? `, ${user.name}` : ""}!`;
      welcomeMessage =
        "Explore our powerful digital tools and exclusive shopping experience, all tailored just for you.";
    }
  }

  return (
    <div className="h-auto md:h-[40rem] w-full rounded-md flex flex-col items-center justify-center relative overflow-hidden mx-auto py-10 md:py-0">
      {/* <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        /> */}
      <Spotlight />
      <div className="p-4 relative z-10 w-full text-center">
        <h1 className="mt-20 md:mt-0 text-4xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 leading-[1.15] tracking-tight">
          {welcomeTitle}
        </h1>
        <p className="mt-4 font-normal text-base md:text-lg text-neutral-300 max-w-2xl mx-auto">
          {welcomeMessage}
        </p>
        <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
          <Link href="/digitalServices">
            <Button
              borderRadius="1.75rem"
              className="bg-white dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              Explore Digital Services
            </Button>
          </Link>
          <Link href="/shop">
            <Button
              borderRadius="1.75rem"
              className="bg-white dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              Shop Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HeroSectionClient;
