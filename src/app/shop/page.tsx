import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/shop-view";
import { getCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full RIAF edit: wireless earbuds, everyday fashion, accessories and home objects.",
};

function ShopFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="h-3 w-24 animate-pulse rounded-full bg-line" />
      <div className="mt-5 h-12 w-64 animate-pulse rounded-xl bg-beige" />
      <div className="mt-8 h-24 w-full animate-pulse rounded-2xl bg-beige/70" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[4/5] animate-pulse rounded-2xl bg-beige/60"
          />
        ))}
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const products = await getCatalogProducts();

  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopView products={products} />
    </Suspense>
  );
}
