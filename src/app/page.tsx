import FeaturedDigitalServices from "@/components/home/FeaturedDigitalServices";
import FeaturedProduct from "@/components/home/FeaturedProduct";
import HeroSection from "@/components/home/HeroSection";
import Testimonials from "@/components/home/TestimonialCards";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedDigitalServices />
      <FeaturedProduct />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}
