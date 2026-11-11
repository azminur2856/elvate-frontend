import { getFeaturedReviews } from "@/lib/catalog";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";
import { SectionHeading } from "./SectionHeading";

/** Shown until enough approved reviews exist (or when the API is asleep). */
const FALLBACK = [
  {
    quote: "I extract text from scanned PDFs for my thesis notes. It takes seconds and the result is clean.",
    name: "Ayesha Rahman",
    title: "University student",
  },
  {
    quote: "Resizing product photos to exact pixels used to need a desktop app. Now I do it in the browser.",
    name: "Md. Tanvir Hossain",
    title: "Small business owner",
  },
  {
    quote: "Ordered a shirt with cash on delivery and could follow the order until it reached my door.",
    name: "Nusrat Jahan",
    title: "Customer, Dhaka",
  },
  {
    quote: "Image to text works well even on photos of printed receipts. Handy for my accounts.",
    name: "Imran Alam",
    title: "Freelancer",
  },
  {
    quote: "Signing in with my face is quick, and the monthly plan was easy to cancel when I didn't need it.",
    name: "Sharmin Akter",
    title: "Content creator",
  },
];

/** Minimum number of real reviews before they replace the fallback list. */
const MIN_REVIEWS = 3;

async function Testimonials() {
  const res = await getFeaturedReviews(10);
  const reviews = res.ok
    ? res.data
        .filter((r) => r.comment)
        .map((r) => ({
          quote: r.comment as string,
          name: r.user?.name ?? "Customer",
          title: r.product ? `Rated ${r.rating}/5 · ${r.product.name}` : `Rated ${r.rating}/5`,
        }))
    : [];
  const items = reviews.length >= MIN_REVIEWS ? reviews : FALLBACK;

  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20" aria-labelledby="testimonials">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          id="testimonials"
          eyebrow={items === reviews ? "Customer reviews" : "Testimonials"}
          title="What people say about Elvate"
          className="mb-10"
        />
        <InfiniteMovingCards items={items} direction="right" speed="slow" />
      </div>
    </section>
  );
}

export default Testimonials;
