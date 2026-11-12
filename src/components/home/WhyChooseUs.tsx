import { StickyScroll } from "../ui/sticky-scroll-reveal";
import { SectionHeading } from "./SectionHeading";

// Keep these claims true to what the app actually does.
const content = [
  {
    title: "Shopping and digital tools in one place",
    description:
      "Shop clothing for men, women and children, and use handy online tools like PDF to text, image to text, image resizing and photo editing, all with the same Elvate account.",
  },
  {
    title: "Quick tools, nothing to install",
    description:
      "Extract text from PDFs and photos, resize images to presets or exact pixels, and crop, rotate, flip or adjust photos right in your browser.",
  },
  {
    title: "One account for everything",
    description:
      "Track your orders, save delivery addresses, manage your subscription and see your account activity from one profile. Sign in with a password, with Google or with your face.",
  },
  {
    title: "A subscription for the tools",
    description:
      "A 1, 6 or 12 month plan unlocks the digital tools. You can see every billing period and turn off auto-renew whenever you like.",
  },
  {
    title: "Pay the way you prefer",
    description:
      "Pay cash on delivery, or pay by card through Stripe's secure checkout. Elvate never sees or stores your card number.",
  },
  {
    title: "Orders you can follow",
    description:
      "Every order has a status timeline, from confirmation and packing to the delivery man at your door, and you can review what you bought once it arrives.",
  },
];

function WhyChooseUs() {
  return (
    <section className="bg-muted/40 py-16 sm:py-20" aria-labelledby="why-elvate">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading id="why-elvate" eyebrow="Why Elvate" title="Everything you need, in one place" className="mb-12" />
        <StickyScroll content={content} />
      </div>
    </section>
  );
}

export default WhyChooseUs;
