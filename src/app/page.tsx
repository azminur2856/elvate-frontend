import FeaturedDigitalServices from "@/components/home/FeaturedDigitalServices";
import FeaturedProduct from "@/components/home/FeaturedProduct";
import HeroSection from "@/components/home/HeroSection";
import ELVATEPlatformTestimonials from "@/components/home/TestimonialCards";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function Home() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <HeroSection />
      <FeaturedDigitalServices />
      <FeaturedProduct />
      <WhyChooseUs />
      <ELVATEPlatformTestimonials />
    </main>
  );
}
