"use client";

import Link from "next/link";
import { formatPrice, getCategoryName } from "@/lib/products";
import { useStore } from "./store";
import { ProductImage } from "./product-image";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { recentProducts, hydrated } = useStore();

  if (!hydrated) return null;

  const items = recentProducts
    .filter((product) => product.id !== excludeId)
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="border-t border-line pt-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
          Your history
        </p>
        <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-ink">
          Recently viewed
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-line bg-white/40 p-2.5 transition-colors hover:border-ink/25"
            >
              <span className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-beige">
                <ProductImage
                  product={product}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[9px] font-medium uppercase tracking-[0.14em] text-ink/35">
                  {getCategoryName(product.category)}
                </span>
                <span className="mt-0.5 block truncate font-heading text-[12px] font-bold text-ink">
                  {product.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-ink/50">
                  {formatPrice(product.price)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
