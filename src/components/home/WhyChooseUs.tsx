import { StickyScroll } from "../ui/sticky-scroll-reveal";
import { SectionHeading } from "./SectionHeading";

const content = [
  {
    title: "One marketplace for shopping and digital work",
    description:
      "Elvate is where online shopping meets instant digital productivity. Discover trending products, gadgets and exclusive deals in one secure marketplace — and use state-of-the-art tools like one-click PDF conversion and AI-powered image editing without leaving the site.",
  },
  {
    title: "Lightning-fast tools for everyday life",
    description:
      "Stop hunting for separate apps. Extract text from a PDF, resize a profile photo, remove an image background or convert documents on the fly — results in seconds, no downloads, no technical skills required.",
  },
  {
    title: "One account, endless possibilities",
    description:
      "Shop for the latest products and access digital tools from a single, easy-to-use account. Manage your orders, unlock premium features and enjoy a consistent experience whether you're buying, editing or creating.",
  },
  {
    title: "Exclusive benefits with Elvate Premium",
    description:
      "Members enjoy discounts on every purchase, enhanced limits on digital services, priority support and early access to new features and products.",
  },
  {
    title: "Security, privacy and satisfaction — guaranteed",
    description:
      "Industry-leading security, end-to-end encryption and transparent privacy policies. Pay securely, get fast delivery, and use our tools knowing your files are never shared or sold.",
  },
  {
    title: "Constant innovation",
    description:
      "We keep adding the latest gadgets, must-have accessories and cutting-edge digital features based on your feedback. Tell us what you want next and help us build the platform of tomorrow.",
  },
];

function WhyChooseUs() {
  return (
    <section className="bg-muted/40 py-16 sm:py-20" aria-labelledby="why-elvate">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Why Elvate" title="Everything you need, in one place" className="mb-12" />
        <StickyScroll content={content} />
      </div>
    </section>
  );
}

export default WhyChooseUs;
