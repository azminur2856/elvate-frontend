import { InfiniteMovingCards } from "../ui/infinite-moving-cards";
import { SectionHeading } from "./SectionHeading";

const testimonials = [
  {
    quote:
      "Elvate is a game changer. I can edit images, convert files and shop for everything I need in one place — my workflow has never been smoother.",
    name: "Ayesha Rahman",
    title: "Freelance designer",
  },
  {
    quote:
      "The background removal and PDF tools are fantastic. Elvate saves me hours every week, and support is always prompt and helpful.",
    name: "Md. Tanvir Hossain",
    title: "Startup founder",
  },
  {
    quote:
      "Finally, a marketplace where I can buy quality products and use digital tools without switching between a dozen websites.",
    name: "Nusrat Jahan",
    title: "University student",
  },
  {
    quote:
      "The subscription unlocks so many extra features — totally worth it. Batch image processing has made my client projects much faster.",
    name: "Imran Alam",
    title: "Photographer & creator",
  },
  {
    quote:
      "What I love about Elvate is the peace of mind. My data feels safe, transactions are secure, and every tool just works.",
    name: "Sharmin Akter",
    title: "E-commerce seller",
  },
  {
    quote:
      "From shopping for gadgets to quick file conversions, everything is seamless and reliable.",
    name: "Mehedi Hasan",
    title: "Tech enthusiast",
  },
];

function Testimonials() {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20" aria-labelledby="testimonials">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Testimonials" title="What people say about Elvate" className="mb-10" />
        <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
      </div>
    </section>
  );
}

export default Testimonials;
