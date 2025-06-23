"use client";
import Link from "next/link";
import { BackgroundGradient } from "../ui/background-gradient";

// If you had product data, import here. For now, we'll show "Coming Soon".
const productData: any[] = []; // empty to trigger coming soon

function FeatureProduct() {
  const featuredProducts = productData.filter?.((p) => p.isFeatured) || [];

  return (
    <div className="py-12 bg-gray-900">
      <div>
        <div className="text-center">
          <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">
            FEATURED PRODUCTS
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            Exclusive Products & Offers
          </p>
        </div>
      </div>
      <div className="mt-10 mx-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {featuredProducts.length === 0 ? (
            <div className="col-span-full flex justify-center items-center h-60">
              <BackgroundGradient className="flex flex-col rounded-[22px] bg-white dark:bg-zinc-900 overflow-hidden h-full max-w-sm min-w-[340px] min-h-[180px] items-center justify-center">
                <div className="p-8 flex flex-col items-center text-center">
                  <p className="text-2xl font-bold text-black dark:text-neutral-200 mb-2">
                    Coming Soon
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Our exclusive product line is almost here.
                    <br />
                    Stay tuned!
                  </p>
                </div>
              </BackgroundGradient>
            </div>
          ) : (
            featuredProducts.map((product: any) => (
              <div key={product.id} className="flex justify-center">
                <BackgroundGradient className="flex flex-col rounded-[22px] bg-white dark:bg-zinc-900 overflow-hidden h-full max-w-sm">
                  <div className="p-4 sm:p-6 flex flex-col items-center text-center flex-grow">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-24 h-24 object-cover rounded-lg mb-4"
                    />
                    <p className="text-lg sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
                      {product.title}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 flex-grow">
                      {product.description}
                    </p>
                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-4 underline text-blue-500 dark:text-blue-400"
                    >
                      Shop Now
                    </Link>
                  </div>
                </BackgroundGradient>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-20 text-center">
        <Link
          href={"/shop"}
          className="px-4 py-2 rounded border border-neutral-600 text-neutral-700 bg-white hover:bg-gray-100 transition duration-200 bg-dark-900 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
}

export default FeatureProduct;
