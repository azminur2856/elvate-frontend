import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { getProduct, getProductReviews, getRelatedProducts } from "@/lib/catalog";
import { categoryHref, productHref } from "@/lib/catalog-url";
import type { ProductDetail } from "@/types/commerce";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductSection } from "@/components/shop/ProductSection";
import { RatingStars } from "@/components/shop/RatingStars";
import { ShopUnavailable } from "@/components/shop/ShopUnavailable";
import { ProductGallery } from "@/components/shop/product/ProductGallery";
import { ProductPurchase } from "@/components/shop/product/ProductPurchase";
import { ProductReviews } from "@/components/shop/reviews/ProductReviews";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ slug: string }> };

const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:3000";

const plain = (text: string, max = 160) => {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getProduct(slug);
  if (!res.ok) {
    if (res.status === 404) notFound();
    return { title: "Product" };
  }
  const p = res.data;
  const description = plain(p.description || `${p.name} at Elvate.`);
  const images = p.mainImage ? [{ url: p.mainImage, alt: p.name }] : undefined;
  return {
    title: p.name,
    description,
    alternates: { canonical: productHref(p.slug) },
    openGraph: { title: p.name, description, images, url: productHref(p.slug) },
    twitter: { card: p.mainImage ? "summary_large_image" : "summary", title: p.name, description },
  };
}

function productJsonLd(p: ProductDetail) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: plain(p.description, 500),
    image: p.images.length ? p.images.map((i) => i.url) : p.mainImage ? [p.mainImage] : undefined,
    sku: p.variants[0]?.sku,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    category: p.category.name,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}${productHref(p.slug)}`,
      priceCurrency: "BDT",
      price: p.effectivePrice.toFixed(2),
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (p.reviewCount > 0) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: p.rating.toFixed(1), reviewCount: p.reviewCount };
  }
  // Escape "<" so a product text can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const PERKS = [
  { icon: Truck, text: "Cash on delivery available" },
  { icon: ShieldCheck, text: "Secure card payment with Stripe" },
  { icon: PackageCheck, text: "Track your order at every step" },
];

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [productRes, relatedRes, reviewsRes] = await Promise.all([
    getProduct(slug),
    getRelatedProducts(slug, 4),
    getProductReviews(slug, 1, 5),
  ]);

  if (!productRes.ok) {
    if (productRes.status === 404) notFound();
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ShopUnavailable title="This product can't be loaded right now" />
      </div>
    );
  }

  const p = productRes.data;
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(p.breadcrumb?.length ? p.breadcrumb : [{ name: p.category.name, slug: p.category.slug }]).map((b) => ({
      label: b.name,
      href: categoryHref(b.slug),
    })),
    { label: p.name },
  ];
  const specs = Object.entries(p.specifications ?? {}).filter(([k, v]) => k && v);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd(p) }} />

      <div className="grid gap-6">
        <Breadcrumbs items={crumbs} />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={p.images} name={p.name} />

          <div className="grid content-start gap-6">
            <div className="grid gap-2">
              {p.brand ? (
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{p.brand}</p>
              ) : null}
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{p.name}</h1>
              <div className="flex flex-wrap items-center gap-3">
                {p.reviewCount > 0 ? (
                  <Link href="#reviews" className="inline-flex items-center gap-2 hover:underline">
                    <RatingStars rating={p.rating} count={p.reviewCount} showValue />
                  </Link>
                ) : null}
                {p.isNewArrival ? <Badge>New</Badge> : null}
                {!p.isActive ? <Badge variant="warning">Hidden from customers</Badge> : null}
              </div>
            </div>

            <ProductPurchase product={p} />

            <ul className="grid gap-2 rounded-xl border p-4 text-sm">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-muted-foreground">
                  <Icon aria-hidden="true" className="size-4 text-brand" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section aria-labelledby="details-heading" className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="grid content-start gap-3">
          <h2 id="details-heading" className="text-2xl font-bold tracking-tight">
            Product details
          </h2>
          {p.description ? (
            <div className="grid gap-3 leading-relaxed text-muted-foreground">
              {p.description
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {para}
                  </p>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No description yet.</p>
          )}
        </div>
        <div className="grid content-start gap-6">
          {specs.length ? (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Specifications</h3>
              <table className="w-full overflow-hidden rounded-xl border text-sm">
                <tbody className="divide-y">
                  {specs.map(([k, v]) => (
                    <tr key={k} className="divide-x">
                      <th scope="row" className="w-2/5 bg-muted/50 px-4 py-2.5 text-left font-medium">
                        {k}
                      </th>
                      <td className="px-4 py-2.5">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {p.material || p.careInstructions ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              {p.material ? (
                <div>
                  <dt className="text-lg font-semibold">Material</dt>
                  <dd className="mt-1 text-muted-foreground">{p.material}</dd>
                </div>
              ) : null}
              {p.careInstructions ? (
                <div>
                  <dt className="text-lg font-semibold">Care</dt>
                  <dd className="mt-1 whitespace-pre-line text-muted-foreground">{p.careInstructions}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </section>

      <ProductReviews
        slug={p.slug}
        productId={p.id}
        productName={p.name}
        initial={reviewsRes.ok ? reviewsRes.data : null}
      />

      <ProductSection
        id="related"
        title="You may also like"
        href={categoryHref(p.category.slug)}
        products={relatedRes.ok ? relatedRes.data : []}
      />
    </div>
  );
}
