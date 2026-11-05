"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "./icons";
import { ProductCard } from "./product-card";
import { useStore } from "./store";

export function WishlistView() {
  const { wishlistProducts, hydrated } = useStore();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="h-12 w-56 animate-pulse rounded-xl bg-beige" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-beige/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-beige text-ink/45">
          <Heart className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-ink">
          Your wishlist is empty
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink/50">
          Tap the heart on anything worth keeping. We will remember it on this
          device.
        </p>
        <Link
          href="/shop"
          className="group mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold text-cream transition-colors hover:bg-olive"
        >
          Find something good
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="text-[11px] text-ink/45">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">Wishlist</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
            Saved
          </p>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Wishlist
          </h1>
        </div>
        <p className="text-[12px] text-ink/45">
          {wishlistProducts.length}{" "}
          {wishlistProducts.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink/60 transition-colors hover:text-ink"
        >
          Continue shopping
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
