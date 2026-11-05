"use client";

import Link from "next/link";
import {
  formatPrice,
  formatReviews,
  getCategoryName,
  type Product,
} from "@/lib/products";
import { useStore } from "./store";
import { Heart, Plus, Star } from "./icons";
import { ProductArt } from "./product-art";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, isWishlisted, toggleWishlist } = useStore();
  const saved = isWishlisted(product.id);

  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
  const saving = product.compareAt ? product.compareAt - product.price : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-white/35 transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:bg-white/70 hover:shadow-[0_30px_60px_-42px_rgba(32,31,28,0.55)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-beige/40">
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="block h-full w-full"
        >
          <ProductArt
            art={product.art}
            tone={product.gallery[0]}
            title={product.name}
            className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1.5">
            {product.badge && (
              <span className="rounded-full bg-cream/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-olive px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-cream">
                Save {discount}%
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border backdrop-blur transition-colors ${
            saved
              ? "border-olive bg-olive text-cream"
              : "border-ink/10 bg-cream/90 text-ink/55 hover:border-ink/30 hover:text-ink"
          }`}
        >
          <Heart className="h-4 w-4" filled={saved} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink/40">
            {getCategoryName(product.category)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-ink/40">
            <Star className="h-3 w-3 text-olive" />
            <span className="font-semibold text-ink/70">
              {product.rating.toFixed(1)}
            </span>
            <span>({formatReviews(product.reviews)})</span>
          </div>
        </div>

        <h3 className="mt-2 font-heading text-[15px] font-bold leading-snug text-ink">
          <Link
            href={`/product/${product.slug}`}
            className="transition-colors hover:text-olive"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-ink/50">
          {product.tagline}
        </p>

        {product.stock > 0 && product.stock <= 10 && (
          <div className="mt-2.5 max-w-[160px]">
            <div className="h-1 overflow-hidden rounded-full bg-line/70">
              <div
                className="h-full rounded-full bg-olive"
                style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.1em] text-olive">
              Only {product.stock} left
            </p>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-lg font-bold text-ink">
                {formatPrice(product.price)}
              </span>
              {product.compareAt && (
                <span className="text-[11px] text-ink/35 line-through">
                  {formatPrice(product.compareAt)}
                </span>
              )}
            </div>
            {saving > 0 && (
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-olive/80">
                Save {formatPrice(saving)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => addItem(product)}
            disabled={product.stock <= 0}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-9 items-center gap-1 rounded-full bg-ink px-3.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            <Plus className="h-3 w-3" />
            {product.stock <= 0 ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
