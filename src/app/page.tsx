import Link from "next/link";
import {
  categories,
  formatPrice,
  formatReviews,
  getCategoryName,
  type Product,
} from "@/lib/products";
import { getCatalogProducts } from "@/lib/catalog";
import { FEATURED_OFFER } from "@/lib/offers";
import {
  ArrowRight,
  CardIcon,
  Check,
  Refresh,
  Shield,
  Sparkles,
  Star,
  Tag,
  Truck,
} from "@/components/icons";
import { Marquee } from "@/components/marquee";
import { NewsletterForm } from "@/components/newsletter-form";
import { OfferCountdown } from "@/components/offer-countdown";
import { ProductArt } from "@/components/product-art";
import { ProductImage } from "@/components/product-image";
import { ProductCard } from "@/components/product-card";
import { PromoCode } from "@/components/promo-code";
import { Reveal } from "@/components/reveal";

const assurances = [
  {
    icon: Truck,
    title: "Free shipping over SAR 75",
    body: "Tracked delivery in 3-5 working days.",
  },
  {
    icon: Refresh,
    title: "30-day returns",
    body: "Unhurried exchanges, no questions asked.",
  },
  {
    icon: Shield,
    title: "2-year warranty",
    body: "Covered against everyday faults.",
  },
  {
    icon: CardIcon,
    title: "Secure checkout",
    body: "Encrypted payments, always.",
  },
];

const marqueeWords = [
  "Considered by design",
  "Made to last",
  "Free shipping over SAR 75",
  "30-day returns",
  "2-year warranty",
  "Fewer, better things",
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const catalog = await getCatalogProducts();
  const heroProduct =
    catalog.find((product) => product.slug === "riaf-buds-pro-2") ??
    catalog.find((product) => product.slug === "riaf-buds-pro") ??
    catalog[0];

  const bestsellerProducts = [...catalog]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  const curatedFeatured = [
    "buds-pro",
    "everyday-hoodie",
    "halo-lamp",
    "everyday-sling",
  ]
    .map((id) => catalog.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  const featuredProducts =
    curatedFeatured.length > 0
      ? curatedFeatured
      : bestsellerProducts.slice(0, 4);

  const offerProducts = catalog
    .filter((product) => product.compareAt)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3);
  const limitedProducts =
    offerProducts.length > 0 ? offerProducts : bestsellerProducts.slice(0, 3);

  const heroDiscount = heroProduct?.compareAt
    ? Math.round((1 - heroProduct.price / heroProduct.compareAt) * 100)
    : 0;
  const heroSaving = heroProduct?.compareAt
    ? heroProduct.compareAt - heroProduct.price
    : 0;
  const heroHref = heroProduct ? `/product/${heroProduct.slug}` : "/shop";
  const heroTone = heroProduct?.gallery[0] ?? "dark";
  const heroArt = heroProduct?.art ?? "earbuds";

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-48 top-0 h-[520px] w-[520px] rounded-full bg-olive/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-32 h-[460px] w-[460px] rounded-full bg-beige/70 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:pb-20 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
            <Reveal>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-olive" />
                    New release —{" "}
                    {heroProduct ? heroProduct.name : "the RIAF edit"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink/45">
                    <Star className="h-3 w-3 text-olive" />
                    {heroProduct
                      ? `${heroProduct.rating.toFixed(1)} / 5`
                      : "New season"}
                  </span>
                </div>

                <h1 className="mt-6 max-w-2xl text-balance font-heading text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-ink">
                  Considered things,
                  <br />
                  <span className="text-olive">chosen to last.</span>
                </h1>

                <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink/60">
                  A close edit of tech, fashion, accessories and home objects.
                  Begin with what is new, then find the quiet essentials around
                  it.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={heroHref}
                    className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold text-cream transition-colors hover:bg-olive"
                  >
                    {heroProduct ? `Shop ${heroProduct.name}` : "Shop the edit"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-white/60"
                  >
                    Explore all products
                  </Link>
                </div>

                <div className="mt-7 flex max-w-lg flex-col gap-3 rounded-2xl border border-line bg-white/45 p-3 sm:flex-row sm:items-center sm:p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-olive-soft text-olive">
                      <Tag className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-olive">
                        Limited offer
                      </p>
                      <p className="mt-0.5 text-[12px] font-semibold text-ink">
                        15% off orders over SAR 100
                      </p>
                    </div>
                  </div>
                  <PromoCode
                    code={FEATURED_OFFER.code}
                    className="w-full justify-center sm:ml-auto sm:w-auto"
                  />
                </div>

                <div className="mt-9 grid max-w-md grid-cols-3 gap-5 border-t border-line pt-6">
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-olive" />
                      <span className="font-heading text-lg font-bold text-ink">
                        {heroProduct ? heroProduct.rating.toFixed(1) : "—"}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink/40">
                      {formatReviews(heroProduct?.reviews ?? 0)} reviews
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-ink">
                      {heroProduct
                        ? heroProduct.stock > 0
                          ? "In stock"
                          : "Sold out"
                        : "Restocking"}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink/40">
                      Availability
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-ink">
                      2-year
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink/40">
                      Warranty
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="relative mx-auto max-w-[560px] lg:max-w-none">
                <div
                  aria-hidden
                  className="absolute -inset-3 rounded-[40px] border border-line/70"
                />
                <div className="relative overflow-hidden rounded-[32px] border border-line bg-beige shadow-[0_40px_90px_-60px_rgba(32,31,28,0.6)]">
                  {heroProduct ? (
                    <ProductImage
                      product={heroProduct}
                      alt={`${heroProduct.name} in ${getCategoryName(
                        heroProduct.category
                      )}`}
                      loading="eager"
                      className="aspect-[5/4] h-full w-full"
                    />
                  ) : (
                    <ProductArt
                      art={heroArt}
                      tone={heroTone}
                      title="The RIAF edit"
                      className="aspect-[5/4] h-full w-full"
                    />
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/25 to-transparent"
                  />
                </div>

                <span className="absolute left-4 top-4 rounded-full border border-cream/20 bg-ink/80 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur">
                  01 /{" "}
                  {heroProduct
                    ? getCategoryName(heroProduct.category)
                    : "The edit"}
                </span>
                {heroDiscount > 0 && (
                  <span className="absolute right-4 top-4 rounded-full bg-olive px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-cream">
                    Save {heroDiscount}%
                  </span>
                )}

                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-cream/10 bg-ink/92 p-4 text-cream backdrop-blur sm:left-6 sm:right-auto sm:w-[285px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-heading text-[15px] font-bold">
                        {heroProduct ? heroProduct.name : "The RIAF edit"}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-cream/55">
                        {heroProduct
                          ? heroProduct.tagline
                          : "Considered everyday objects."}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {heroProduct && (
                        <span className="block whitespace-nowrap font-heading text-[15px] font-bold">
                          {formatPrice(heroProduct.price)}
                        </span>
                      )}
                      {heroProduct?.compareAt && (
                        <span className="mt-0.5 block text-[10px] text-cream/35 line-through">
                          {formatPrice(heroProduct.compareAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={heroHref}
                    className="mt-3 flex items-center justify-between border-t border-cream/15 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream/75 transition-colors hover:text-cream"
                  >
                    Shop now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-beige/35">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-6 px-4 py-7 sm:px-6 lg:grid-cols-4">
          {assurances.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/70 text-ink/65">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-ink">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink/45">
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="offer"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16"
      >
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-ink text-cream">
            <div
              aria-hidden
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-cream/10"
            />
            <div
              aria-hidden
              className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-olive/20 blur-3xl"
            />

            <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-cream/70">
                  <Tag className="h-3.5 w-3.5 text-[#c8d4b9]" />
                  Limited offer
                </span>

                <h2 className="mt-5 font-heading text-3xl font-extrabold leading-[0.98] tracking-tight sm:text-4xl lg:text-[2.75rem]">
                  The quiet hours
                  <br />
                  <span className="text-[#c8d4b9]">offer.</span>
                </h2>

                <p className="mt-4 max-w-md text-[13px] leading-relaxed text-cream/55">
                  {`Take ${FEATURED_OFFER.percent}% off orders over SAR ${FEATURED_OFFER.minSubtotal} across the edit. A quieter cart, a better price. Ends Sunday.`}
                </p>

                <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cream/35">
                      Use code
                    </p>
                    <PromoCode
                      code={FEATURED_OFFER.code}
                      tone="dark"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cream/35">
                      Ends in
                    </p>
                    <OfferCountdown className="mt-2" />
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="group mt-7 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-[12px] font-semibold text-ink transition-colors hover:bg-beige"
                >
                  Shop the offer
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>

              {limitedProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-cream/35">
                    <span>Included in the edit</span>
                    <span>{limitedProducts.length} pieces</span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {limitedProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="group flex items-center gap-3 rounded-2xl border border-cream/10 bg-cream/[0.04] p-2.5 transition-colors hover:border-cream/20 hover:bg-cream/[0.08]"
                      >
                        <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-cream/10 bg-beige">
                          <ProductImage
                            product={product}
                            alt={product.name}
                            className="h-full w-full"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-semibold text-cream">
                            {product.name}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-cream/40">
                            {product.compareAt
                              ? `Save ${formatPrice(
                                  product.compareAt - product.price
                                )}`
                              : "Included in the offer"}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block font-heading text-[12px] font-bold text-cream">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAt && (
                            <span className="mt-0.5 block text-[9px] text-cream/30 line-through">
                              {formatPrice(product.compareAt)}
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
                Browse
              </p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Shop by category
              </h2>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink/50">
                Four focused departments. Every item earns its place.
              </p>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink/65 transition-colors hover:text-ink"
            >
              View everything
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const productCount = catalog.filter(
              (product) => product.category === category.slug
            ).length;

            return (
              <Reveal key={category.slug} delay={index * 60}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-white/40 transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:bg-white/70 hover:shadow-[0_30px_60px_-42px_rgba(32,31,28,0.55)]"
                >
                  <div className="relative overflow-hidden">
                    <ProductArt
                      art={category.art}
                      tone={category.tone}
                      title={`${category.name} collection`}
                      className="aspect-[4/5] h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                    />
                    <span className="absolute left-3.5 top-3.5 rounded-full border border-cream/20 bg-ink/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur">
                      0{index + 1}
                    </span>
                    <span className="absolute bottom-3.5 right-3.5 grid h-9 w-9 place-items-center rounded-full border border-cream/20 bg-cream/90 text-ink transition-all duration-300 group-hover:bg-ink group-hover:text-cream">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-heading text-[16px] font-bold text-ink">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink/45">
                      {category.description}
                    </p>
                    <p className="mt-auto pt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-ink/35">
                      {productCount} products
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
                  The edit
                </p>
                <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Featured this week
                </h2>
              </div>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink/65 transition-colors hover:text-ink"
              >
                Shop all
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <Reveal key={product.id} delay={index * 55}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-line bg-beige/25 py-5">
        <Marquee
          className="mask-fade-x"
          duration={48}
          items={marqueeWords.map((word) => (
            <span
              key={word}
              className="flex items-center gap-2.5 font-heading text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/40"
            >
              <Sparkles className="h-3 w-3 text-olive/70" />
              {word}
            </span>
          ))}
        />
      </section>

      {heroProduct && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <Reveal>
            <div className="grid overflow-hidden rounded-[32px] bg-ink text-cream lg:grid-cols-2">
              <div className="relative order-2 min-h-[320px] lg:order-1">
                <ProductImage
                  product={heroProduct}
                  index={1}
                  alt={heroProduct.name}
                  className="h-full w-full"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent"
                />
                <span className="absolute left-5 top-5 rounded-full border border-cream/20 bg-ink/40 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur">
                  {getCategoryName(heroProduct.category)}
                </span>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                  <p className="max-w-[180px] text-[11px] leading-relaxed text-cream/65">
                    {heroProduct.tagline}
                  </p>
                  <span className="rounded-full border border-cream/15 bg-ink/45 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-cream/70 backdrop-blur">
                    {heroProduct.badge ?? "New"}
                  </span>
                </div>
              </div>

              <div className="order-1 flex flex-col justify-center p-7 sm:p-10 lg:order-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/40">
                  {getCategoryName(heroProduct.category)}
                </p>
                <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  Considered in
                  <br />
                  every detail.
                </h2>
                <p className="mt-4 max-w-md text-[13px] leading-relaxed text-cream/55">
                  {heroProduct.description}
                </p>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {heroProduct.features.slice(0, 4).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[12px] text-cream/70"
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-cream/10">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/product/${heroProduct.slug}`}
                    className="group inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-beige"
                  >
                    Shop {heroProduct.name}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <div>
                    <span className="font-heading text-lg font-bold">
                      {formatPrice(heroProduct.price)}
                    </span>
                    {heroProduct.compareAt && (
                      <span className="ml-2 text-[11px] font-normal text-cream/35 line-through">
                        {formatPrice(heroProduct.compareAt)}
                      </span>
                    )}
                    {heroSaving > 0 && (
                      <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[#c8d4b9]">
                        Save {formatPrice(heroSaving)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {bestsellerProducts.length > 0 && (
        <section className="border-y border-line bg-beige/45 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
                  Most loved
                </p>
                <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Bestsellers
                </h2>
              </div>
              <Link
                href="/shop?sort=popular"
                className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink/65 transition-colors hover:text-ink"
              >
                Shop bestsellers
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellerProducts.map((product, index) => (
              <Reveal key={product.id} delay={index * 55}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
                Our approach
              </p>
              <h2 className="mt-2 max-w-xl font-heading text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
                One marketplace. A much shorter shortlist.
              </h2>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-ink/55">
                We do not list everything. We test, live with and narrow each
                category down to a handful of pieces that feel good to own and
                better to use. Fewer choices, made more carefully.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Small-batch", "Tested in real life", "Built to last"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-line bg-white/50 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink/45"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
              <Link
                href="/about"
                className="group mt-6 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink/70 transition-colors hover:text-ink"
              >
                Read our standards
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  value: String(catalog.length).padStart(2, "0"),
                  label: "Products in the edit",
                  body: "Small enough to know well.",
                },
                {
                  value: "04",
                  label: "Focused categories",
                  body: "Tech, fashion, accessories, home.",
                },
                {
                  value: "30",
                  label: "Days to decide",
                  body: "Returns stay simple and free.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 rounded-2xl border border-line bg-white/40 p-4 transition-colors hover:bg-white/65"
                >
                  <span className="font-heading text-2xl font-extrabold text-olive">
                    {item.value}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-ink">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink/45">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] border border-line bg-beige/55 p-7 sm:p-10">
            <div
              aria-hidden
              className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-olive/10 blur-3xl"
            />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
                  Private list
                </p>
                <h2 className="mt-2 max-w-lg font-heading text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
                  First access. Better offers.
                </h2>
                <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink/55">
                  New arrivals, restocks and the occasional limited offer.
                  Considered updates only, never noise.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ink/50">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-olive" />
                    Early access to drops
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-olive" />
                    Member-only offers
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-cream/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">
                    Get the welcome code
                  </p>
                  <PromoCode code="RIAF10" />
                </div>
                <NewsletterForm />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
