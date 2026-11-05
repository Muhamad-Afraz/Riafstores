"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/products";
import {
  ArrowRight,
  Bag,
  Minus,
  Plus,
  Refresh,
  Shield,
  Trash,
  Truck,
} from "./icons";
import { CouponForm } from "./coupon-form";
import { ProductArt } from "./product-art";
import { useStore } from "./store";

const FREE_SHIPPING_THRESHOLD = 75;

export function CartView() {
  const {
    items,
    count,
    subtotal,
    discount,
    shipping,
    total,
    appliedCode,
    coupon,
    hydrated,
    catalog,
    updateQuantity,
    removeItem,
    clearCart,
  } = useStore();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="h-3 w-20 animate-pulse rounded-full bg-line" />
        <div className="mt-4 h-12 w-56 animate-pulse rounded-xl bg-beige" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_0.85fr]">
          <div className="h-72 animate-pulse rounded-2xl bg-beige/60" />
          <div className="h-72 animate-pulse rounded-2xl bg-beige/60" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-beige text-ink/50">
          <Bag className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-ink">
          Your cart is empty
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink/50">
          A short list of good things is waiting. Start with the earbuds, or
          browse the full RIAF edit.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold text-cream transition-colors hover:bg-olive"
          >
            Browse all products
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/product/riaf-buds-pro"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-white/60"
          >
            Shop the Buds Pro
          </Link>
        </div>
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
        <span className="text-ink/70">Cart</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
            Review
          </p>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Your cart
          </h1>
        </div>
        <p className="text-[12px] text-ink/45">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_0.85fr] lg:items-start">
        <div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white/40">
            {items.map((item) => {
              const product = catalog.find((entry) => entry.id === item.productId);
              const maxQuantity = product?.stock ?? 99;

              return (
                <div
                  key={item.key}
                  className="flex flex-col gap-4 border-b border-line p-4 last:border-b-0 sm:flex-row sm:items-center sm:p-5"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-beige"
                  >
                    <ProductArt
                      art={item.art}
                      tone={item.tone}
                      title={item.name}
                      className="h-full w-full"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-heading text-[15px] font-bold text-ink transition-colors hover:text-olive"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-ink/45">
                      {product?.variantLabel ?? "Option"}: {item.variant}
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-ink/65">
                      {formatPrice(item.price)} each
                    </p>

                    {product && product.stock <= 10 && (
                      <p className="mt-1 text-[10px] font-medium text-olive">
                        Only {product.stock} left
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
                    <div className="flex h-9 items-center justify-between rounded-full border border-line px-1.5 sm:w-[116px]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.key, item.quantity - 1)
                        }
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="grid h-6 w-6 place-items-center rounded-full text-ink/55 transition-colors hover:bg-beige hover:text-ink"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-5 text-center text-[12px] font-semibold text-ink">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.key, item.quantity + 1)
                        }
                        disabled={item.quantity >= maxQuantity}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="grid h-6 w-6 place-items-center rounded-full text-ink/55 transition-colors hover:bg-beige hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-heading text-[15px] font-bold text-ink">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="grid h-8 w-8 place-items-center rounded-full text-ink/35 transition-colors hover:bg-beige hover:text-ink"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink/60 transition-colors hover:text-ink"
            >
              Continue shopping
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="text-[11px] font-medium text-ink/35 underline-offset-4 transition-colors hover:text-ink/70 hover:underline"
            >
              Clear cart
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-line bg-white/50 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-bold text-ink">
              Order summary
            </h2>

            <div className="mt-4 space-y-2.5 text-[12px]">
              <div className="flex items-center justify-between text-ink/55">
                <span>Subtotal</span>
                <span className="font-medium text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>
              {appliedCode && coupon && (
                <div className="flex items-center justify-between text-ink/55">
                  <span>Offer · {coupon.code}</span>
                  <span
                    className={`font-medium ${
                      discount > 0 ? "text-olive" : "text-ink/35"
                    }`}
                  >
                    {discount > 0 ? `−${formatPrice(discount)}` : "Pending"}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-ink/55">
                <span>Shipping</span>
                <span className="font-medium text-ink">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <CouponForm />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-ink/55">
              <span className="text-[12px] font-medium text-ink">Total</span>
              <div className="text-right">
                <span className="font-heading text-lg font-extrabold text-ink">
                  {formatPrice(total)}
                </span>
                {discount > 0 && (
                  <p className="text-[10px] font-medium text-olive">
                    You save {formatPrice(discount)}
                  </p>
                )}
              </div>
            </div>

            {remaining > 0 ? (
              <div className="mt-4 rounded-xl bg-beige/60 p-3">
                <p className="text-[11px] text-ink/60">
                  You are{" "}
                  <span className="font-semibold text-ink">
                    {formatPrice(remaining)}
                  </span>{" "}
                  away from free shipping.
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rounded-full bg-olive transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-olive-soft px-3 py-2.5 text-[11px] font-medium text-olive">
                Free shipping unlocked.
              </p>
            )}

            <Link
              href="/checkout"
              className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[13px] font-semibold text-cream transition-colors hover:bg-olive"
            >
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-5 space-y-2.5 border-t border-line pt-4">
              <div className="flex items-center gap-2 text-[11px] text-ink/50">
                <Truck className="h-4 w-4 shrink-0 text-olive" />
                Free tracked shipping over $75
              </div>
              <div className="flex items-center gap-2 text-[11px] text-ink/50">
                <Refresh className="h-4 w-4 shrink-0 text-olive" />
                Free 30-day returns
              </div>
              <div className="flex items-center gap-2 text-[11px] text-ink/50">
                <Shield className="h-4 w-4 shrink-0 text-olive" />
                Secure, encrypted checkout
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
