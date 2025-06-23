"use client";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

const elvatePlatformTestimonials = [
  {
    quote:
      "ELVATE is a game changer! I can edit images, convert files, and shop for everything I need in one place. It’s so intuitive—my workflow has never been smoother.",
    name: "Ayesha Rahman",
    title: "Freelance Designer",
  },
  {
    quote:
      "The background removal and PDF tools are fantastic. ELVATE saves me hours every week, and the customer support is always prompt and helpful.",
    name: "Md. Tanvir Hossain",
    title: "Startup Founder",
  },
  {
    quote:
      "Finally, an online marketplace where I can purchase quality products and use digital tools without switching between dozens of websites. ELVATE is my daily go-to!",
    name: "Nusrat Jahan",
    title: "University Student",
  },
  {
    quote:
      "The subscription unlocks so many extra features—totally worth it! Batch processing images and one-click downloads have made my client projects so much faster.",
    name: "Imran Alam",
    title: "Photographer & Creator",
  },
  {
    quote:
      "What I love about ELVATE is the peace of mind. My data feels safe, my transactions are secure, and every tool just works, right out of the box.",
    name: "Sharmin Akter",
    title: "E-commerce Seller",
  },
  {
    quote:
      "ELVATE has truly elevated my productivity. From shopping for gadgets to quick file conversions, everything is seamless and reliable.",
    name: "Mehedi Hasan",
    title: "Tech Enthusiast",
  },
];

function ELVATEPlatformTestimonials() {
  return (
    <div className="h-[40rem] w-full dark:bg-black dark:bg-grid-white/[0.2] relative flex flex-col items-center justify-center overflow-hidden">
      <h2 className="text-3xl font-bold text-center mb-8 z-10">
        Hear our Harmony: Voices of success
      </h2>
      <div className="flex justify-center w-full overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <InfiniteMovingCards
            items={elvatePlatformTestimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </div>
    </div>
  );
}

export default ELVATEPlatformTestimonials;
