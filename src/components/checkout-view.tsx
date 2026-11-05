"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/products";
import { ArrowLeft, CardIcon, Check, Shield } from "./icons";
import { CouponForm } from "./coupon-form";
import { ProductArt } from "./product-art";
import { useStore } from "./store";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-line bg-cream px-3.5 text-[13px] text-ink placeholder:text-ink/35 transition-colors focus:border-ink/45 focus:outline-none";

const labelClass = "text-[11px] font-medium text-ink/55";

function SectionHeading({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink font-heading text-[11px] font-bold text-cream">
        {step}
      </span>
      <div>
        <h2 className="font-heading text-lg font-bold text-ink">{title}</h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink/45">
          {description}
        </p>
      </div>
    </div>
  );
}

export function CheckoutView() {
  const {
    items,
    count,
    subtotal,
    discount,
    appliedCode,
    coupon,
    hydrated,
  } = useStore();
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"card" | "paypal" | "apple">("card");

  const standardShipping = subtotal >= 75 ? 0 : 6;
  const shipping = delivery === "express" ? 12 : standardShipping;
  const total = Math.max(0, subtotal - discount) + shipping;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="h-12 w-56 animate-pulse rounded-xl bg-beige" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="h-96 animate-pulse rounded-2xl bg-beige/60" />
          <div className="h-96 animate-pulse rounded-2xl bg-beige/60" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-beige text-ink/50">
          <CardIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-ink">
          Nothing to check out
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink/50">
          Add a few considered things to your cart first, then come back when
          you are ready.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold text-cream transition-colors hover:bg-olive"
        >
          Browse products
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
        <Link href="/cart" className="transition-colors hover:text-ink">
          Cart
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">Checkout</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
            Almost there
          </p>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Checkout
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line bg-white/50 px-3 py-1.5 text-[11px] text-ink/50">
          <Shield className="h-4 w-4 text-olive" />
          Secure checkout
        </div>
      </div>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-start"
      >
        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-white/45 p-5 sm:p-6">
            <SectionHeading
              step="1"
              title="Contact"
              description="We will use this to send your order updates."
            />
            <div className="mt-5">
              <label htmlFor="checkout-email" className={labelClass}>
                Email address
              </label>
              <input
                id="checkout-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={fieldClass}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white/45 p-5 sm:p-6">
            <SectionHeading
              step="2"
              title="Delivery"
              description="Where should we send your order?"
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="checkout-first" className={labelClass}>
                  First name
                </label>
                <input
                  id="checkout-first"
                  autoComplete="given-name"
                  placeholder="First name"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-last" className={labelClass}>
                  Last name
                </label>
                <input
                  id="checkout-last"
                  autoComplete="family-name"
                  placeholder="Last name"
                  className={fieldClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-address" className={labelClass}>
                  Address
                </label>
                <input
                  id="checkout-address"
                  autoComplete="street-address"
                  placeholder="Street address"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-city" className={labelClass}>
                  City
                </label>
                <input
                  id="checkout-city"
                  autoComplete="address-level2"
                  placeholder="City"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-postcode" className={labelClass}>
                  Postcode
                </label>
                <input
                  id="checkout-postcode"
                  autoComplete="postal-code"
                  placeholder="Postcode"
                  className={fieldClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-country" className={labelClass}>
                  Country
                </label>
                <select
                  id="checkout-country"
                  autoComplete="country-name"
                  className={`${fieldClass} cursor-pointer`}
                  defaultValue="United Kingdom"
                >
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Netherlands</option>
                  <option>United Arab Emirates</option>
                  <option>Singapore</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <p className={labelClass}>Delivery method</p>

              {[
                {
                  value: "standard" as const,
                  title: "Standard delivery",
                  note: "3-5 working days",
                  price: standardShipping,
                },
                {
                  value: "express" as const,
                  title: "Express delivery",
                  note: "1-2 working days",
                  price: 12,
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                    delivery === option.value
                      ? "border-ink bg-cream"
                      : "border-line bg-transparent hover:border-ink/30"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value={option.value}
                      checked={delivery === option.value}
                      onChange={() => setDelivery(option.value)}
                      className="sr-only"
                    />
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-full border ${
                        delivery === option.value
                          ? "border-ink bg-ink text-cream"
                          : "border-line"
                      }`}
                    >
                      {delivery === option.value && (
                        <Check className="h-2.5 w-2.5" />
                      )}
                    </span>
                    <span>
                      <span className="block text-[12px] font-semibold text-ink">
                        {option.title}
                      </span>
                      <span className="block text-[10px] text-ink/45">
                        {option.note}
                      </span>
                    </span>
                  </span>
                  <span className="text-[12px] font-semibold text-ink">
                    {option.price === 0 ? "Free" : formatPrice(option.price)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white/45 p-5 sm:p-6">
            <SectionHeading
              step="3"
              title="Payment"
              description="This is a placeholder interface. No payment will be taken."
            />

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { value: "card" as const, label: "Card" },
                { value: "paypal" as const, label: "PayPal" },
                { value: "apple" as const, label: "Apple Pay" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPayment(option.value)}
                  aria-pressed={payment === option.value}
                  className={`rounded-xl border px-3 py-2.5 text-[12px] font-medium transition-colors ${
                    payment === option.value
                      ? "border-ink bg-ink text-cream"
                      : "border-line text-ink/55 hover:border-ink/30 hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {payment === "card" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-card" className={labelClass}>
                    Card number
                  </label>
                  <input
                    id="checkout-card"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-expiry" className={labelClass}>
                    Expiry
                  </label>
                  <input
                    id="checkout-expiry"
                    autoComplete="cc-exp"
                    placeholder="MM / YY"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-cvc" className={labelClass}>
                    CVC
                  </label>
                  <input
                    id="checkout-cvc"
                    autoComplete="cc-csc"
                    placeholder="CVC"
                    className={fieldClass}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-beige/60 px-3.5 py-3 text-[11px] leading-relaxed text-ink/55">
                {payment === "paypal"
                  ? "You would be redirected to PayPal to approve this payment."
                  : "You would confirm this payment with Apple Pay on your device."}
              </p>
            )}

            <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-ink/40">
              <CardIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Demo storefront: payment fields and order placement are disabled.
              Nothing will be charged or shipped.
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-line bg-white/50 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-ink">
                Order summary
              </h2>
              <Link
                href="/cart"
                className="text-[11px] font-medium text-ink/45 transition-colors hover:text-ink"
              >
                Edit cart
              </Link>
            </div>

            <div className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-beige">
                    <ProductArt
                      art={item.art}
                      tone={item.tone}
                      className="h-full w-full"
                    />
                    <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-semibold text-cream">
                      {item.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-ink">
                      {item.name}
                    </span>
                    <span className="block truncate text-[10px] text-ink/40">
                      {item.variant}
                    </span>
                  </span>
                  <span className="text-[12px] font-medium text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <CouponForm />
            </div>

            <div className="mt-4 space-y-2.5 border-t border-line pt-4 text-[12px]">
              <div className="flex items-center justify-between text-ink/55">
                <span>Subtotal ({count} items)</span>
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
              <div className="flex items-center justify-between border-t border-line pt-2.5">
                <span className="font-medium text-ink">Total</span>
                <div className="text-right">
                  <span className="font-heading text-xl font-extrabold text-ink">
                    {formatPrice(total)}
                  </span>
                  {discount > 0 && (
                    <p className="text-[10px] font-medium text-olive">
                      You save {formatPrice(discount)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 h-12 w-full rounded-full bg-ink px-6 text-[13px] font-semibold text-cream transition-colors hover:bg-olive"
            >
              Place order — {formatPrice(total)}
            </button>

            <p className="mt-3 text-center text-[10px] leading-relaxed text-ink/40">
              Order placement is not enabled in this demo. By continuing you
              would agree to the RIAF terms and privacy policy.
            </p>

            <Link
              href="/cart"
              className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-ink/50 transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to cart
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
