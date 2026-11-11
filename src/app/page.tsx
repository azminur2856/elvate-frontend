import FeaturedDigitalServices from "@/components/home/FeaturedDigitalServices";
import FeaturedProduct from "@/components/home/FeaturedProduct";
import HeroSection from "@/components/home/HeroSection";
import Testimonials from "@/components/home/TestimonialCards";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import { FlashSaleStrip } from "@/components/shop/OfferCards";
import { getOffers } from "@/lib/catalog";

export default async function Home() {
  const offers = await getOffers();
  // The soonest-ending live sale, if any.
  const sale = offers.ok
    ? [...offers.data.flashSales].sort((a, b) => a.endsAt.localeCompare(b.endsAt))[0]
    : undefined;

  return (
    <>
      {sale ? <FlashSaleStrip sale={sale} /> : null}
      <HeroSection />
      <FeaturedDigitalServices />
      <FeaturedProduct />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}
