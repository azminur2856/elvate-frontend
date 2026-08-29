import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Digital Services", href: "/digitalServices" },
  { label: "Shop", href: "/shop" },
  { label: "Subscription", href: "/subscription" },
  { label: "Contact", href: "/contact" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socials = [
  { label: "Facebook", href: "https://facebook.com/elvatebd", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/elvatebd", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com/elvatebd", icon: Instagram },
];

function Footer() {
  return (
    <footer className="border-t border-border bg-card text-muted-foreground">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">About Elvate</h2>
          <p className="text-sm leading-relaxed">
            Elvate is your trusted platform for innovative digital services and
            secure online shopping in Bangladesh — powerful tools and a seamless
            e-commerce experience, all in one place.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick links</h2>
          <ul className="grid gap-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Follow us</h2>
          <ul className="flex gap-4">
            {socials.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (opens in a new tab)`}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icon aria-hidden="true" className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <address className="text-sm not-italic leading-relaxed">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Contact us</h2>
          <p>Ka-96/1, Kazi Bari, Kuril Bisho Road, Dhaka, Bangladesh</p>
          <p className="mt-2">
            Email:{" "}
            <a href="mailto:support@elvate.com" className="text-link hover:underline">
              support@elvate.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+8801234567890" className="hover:text-foreground">
              +880 1234-567890
            </a>
          </p>
        </address>
      </div>
      <p className="border-t border-border px-4 py-6 text-center text-sm">
        © {new Date().getFullYear()} Elvate. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
