"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FEATURED_OFFER } from "@/lib/offers";
import {
  formatPrice,
  formatReviews,
  getCategory,
  getProductImages,
  getRelatedProducts,
  type Product,
} from "@/lib/products";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  Refresh,
  Shield,
  Star,
  Tag,
  Truck,
} from "./icons";
import { ProductImage } from "./product-image";
import { ProductCard } from "./product-card";
import { PromoCode } from "./promo-code";
import { useStore } from "./store";

const toneLabels = ["Front", "Detail", "In context"];

export function ProductDetail({
  product,
  related: relatedProducts,
}: {
  product: Product;
  related?: Product[];
}) {
  const { addItem, isWishlisted, toggleWishlist, recordView, notify } =
    useStore();

  const [mediaIndex, setMediaIndex] = useState(0);
  const [variant, setVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const category = getCategory(product.category);
  const saved = isWishlisted(product.id);
  const related = relatedProducts ?? getRelatedProducts(product);
  const outOfStock = product.stock <= 0;
  const uploadedImages = getProductImages(product);
  const mediaCount =
    uploadedImages.length > 0 ? uploadedImages.length : product.gallery.length;
  const activeTone =
    product.gallery[mediaIndex % Math.max(1, product.gallery.length)] ??
    product.gallery[0] ??
    "cream";
  const mediaLabels =
    uploadedImages.length > 0
      ? [
          "Main picture",
          ...Array.from(
            { length: Math.max(0, mediaCount - 1) },
            (_, index) => `Showcase ${index + 1}`,
          ),
        ]
      : toneLabels;
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
  const saving = product.compareAt ? product.compareAt - product.price : 0;

  useEffect(() => {
    recordView(product.id);
  }, [product.id, recordView]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="text-[11px] text-ink/45">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="transition-colors hover:text-ink">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/shop?category=${product.category}`}
          className="transition-colors hover:text-ink"
        >
          {category?.name ?? "Products"}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative overflow-hidden rounded-[24px] border border-line bg-beige">
            <ProductImage
              product={product}
              index={mediaIndex}
              alt={`${product.name}, ${(mediaLabels[mediaIndex] ?? "product picture").toLowerCase()}`}
              loading="eager"
              className="aspect-[5/4] h-full w-full"
            />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-cream/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute right-4 top-4 rounded-full bg-olive px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-cream">
                Save {discount}%
              </span>
            )}
          </div>

          {mediaCount > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {Array.from({ length: mediaCount }, (_, index) => (
                <button
                  key={`media-${index}`}
                  type="button"
                  onClick={() => setMediaIndex(index)}
                  aria-label={`View ${mediaLabels[index] ?? `image ${index + 1}`}`}
                  aria-pressed={mediaIndex === index}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    mediaIndex === index
                      ? "border-ink"
                      : "border-line hover:border-ink/35"
                  }`}
                >
                  <ProductImage
                    product={product}
                    index={index}
                    alt={mediaLabels[index] ?? `${product.name} picture ${index + 1}`}
                    className="aspect-[5/4] h-full w-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
            {category?.name}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-[14px] text-ink/50">{product.tagline}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-ink/50">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-3.5 w-3.5 ${
                    index < Math.round(product.rating)
                      ? "text-olive"
                      : "text-line"
                  }`}
                />
              ))}
            </span>
            <span className="font-medium text-ink/75">
              {product.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{formatReviews(product.reviews)} reviews</span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-heading text-3xl font-extrabold text-ink">
              {formatPrice(product.price)}
            </span>
            {product.compareAt && (
              <span className="text-[13px] text-ink/35 line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
            {saving > 0 && (
              <span className="rounded-full bg-olive-soft px-2.5 py-1 text-[10px] font-semibold text-olive">
                Save {formatPrice(saving)}
              </span>
            )}
            <span className="rounded-full bg-beige/70 px-2.5 py-1 text-[10px] font-semibold text-ink/55">
              {outOfStock
                ? "Sold out"
                : product.stock <= 10
                  ? `Only ${product.stock} left`
                  : "In stock"}
            </span>
          </div>

          {product.stock > 0 && product.stock <= 10 && (
            <div className="mt-3 max-w-[220px]">
              <div className="h-1 overflow-hidden rounded-full bg-line/70">
                <div
                  className="h-full rounded-full bg-olive"
                  style={{
                    width: `${Math.min(100, (product.stock / 20) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-olive">
                Selling quickly — {product.stock} remaining
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-beige/30 px-3 py-2 text-[11px] text-ink/55">
            <Tag className="h-3.5 w-3.5 shrink-0 text-olive" />
            <span>
              {`Extra ${FEATURED_OFFER.percent}% off orders over SAR ${FEATURED_OFFER.minSubtotal}`}
            </span>
            <PromoCode code={FEATURED_OFFER.code} />
          </div>

          <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-ink/60">
            {product.description}
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/40">
                {product.variantLabel}
              </p>
              <p className="text-[11px] text-ink/45">{variant}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVariant(option)}
                  aria-pressed={variant === option}
                  className={`rounded-full border px-4 py-2 text-[12px] font-medium transition-colors ${
                    variant === option
                      ? "border-ink bg-ink text-cream"
                      : "border-line bg-transparent text-ink/60 hover:border-ink/35 hover:text-ink"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 items-center justify-between rounded-full border border-line px-2 sm:w-[132px]">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="grid h-8 w-8 place-items-center rounded-full text-ink/60 transition-colors hover:bg-beige hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-6 text-center text-[13px] font-semibold text-ink">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) => Math.min(product.stock, value + 1))
                }
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
                className="grid h-8 w-8 place-items-center rounded-full text-ink/60 transition-colors hover:bg-beige hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (outOfStock) {
                  notify("This item is currently sold out");
                  return;
                }
                addItem(product, {
                  variant,
                  tone: activeTone,
                  quantity,
                });
                setQuantity(1);
              }}
              disabled={outOfStock}
              className="h-12 flex-1 rounded-full bg-ink px-6 text-[13px] font-semibold text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:bg-ink/30"
            >
              {outOfStock
                ? "Sold out"
                : `Add to cart — ${formatPrice(product.price * quantity)}`}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={saved}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors ${
                saved
                  ? "border-olive bg-olive text-cream"
                  : "border-line text-ink/60 hover:border-ink/35 hover:text-ink"
              }`}
            >
              <Heart className="h-5 w-5" filled={saved} />
            </button>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-white/40 p-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-[11px] text-ink/60">
              <Truck className="h-4 w-4 shrink-0 text-olive" />
              Free shipping over SAR 75
            </div>
            <div className="flex items-center gap-2 text-[11px] text-ink/60">
              <Refresh className="h-4 w-4 shrink-0 text-olive" />
              30-day returns
            </div>
            <div className="flex items-center gap-2 text-[11px] text-ink/60">
              <Shield className="h-4 w-4 shrink-0 text-olive" />
              2-year warranty
            </div>
          </div>

          <div className="mt-6">
            <details className="group border-t border-line py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-semibold text-ink">
                Details & materials
                <ChevronDown className="h-4 w-4 text-ink/40 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <ul className="mt-3 space-y-2">
                {product.details.map((detail) => (
                  <li
                    key={detail}
                    className="flex items-start gap-2 text-[12px] text-ink/55"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-olive" />
                    {detail}
                  </li>
                ))}
              </ul>
            </details>

            <details className="group border-y border-line py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-semibold text-ink">
                In the box & care
                <ChevronDown className="h-4 w-4 text-ink/40 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <ul className="mt-3 space-y-2">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[12px] text-ink/55"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-olive" />
                    {feature}
                  </li>
                ))}
              </ul>
            </details>

            <details className="group border-b border-line py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-semibold text-ink">
                Shipping & returns
                <ChevronDown className="h-4 w-4 text-ink/40 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
                Dispatched within one working day. Tracked delivery arrives in
                3-5 working days, free over SAR 75. Returns are free within 30
                days, in original condition.
              </p>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
                Keep looking
              </p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                You may also like
              </h2>
            </div>
            <Link
              href={`/shop?category=${product.category}`}
              className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink/60 transition-colors hover:text-ink"
            >
              More in {category?.name}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
