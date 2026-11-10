"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FEATURED_OFFER } from "@/lib/offers";
import {
  categories,
  matchesQuery,
  type CategorySlug,
  type Product,
} from "@/lib/products";
import { Close, Search, Sliders, Tag } from "./icons";
import { ProductCard } from "./product-card";
import { PromoCode } from "./promo-code";
import { Reveal } from "./reveal";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

type SortValue = (typeof sortOptions)[number]["value"];

const validSorts = sortOptions.map((option) => option.value);

function isCategorySlug(value: string): value is CategorySlug {
  return categories.some((category) => category.slug === value);
}

export function ShopView({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const sortParam = searchParams.get("sort") ?? "featured";
  const sort: SortValue = validSorts.includes(sortParam as SortValue)
    ? (sortParam as SortValue)
    : "featured";

  const activeCategory = isCategorySlug(categoryParam)
    ? categories.find((category) => category.slug === categoryParam) ?? null
    : null;

  const [search, setSearch] = useState(q);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  const replaceParams = useCallback(
    (next: URLSearchParams) => {
      const query = next.toString();
      router.replace(query ? `/shop?${query}` : "/shop", { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (search.trim()) {
        next.set("q", search.trim());
      } else {
        next.delete("q");
      }
      if (next.toString() !== searchParams.toString()) {
        replaceParams(next);
      }
    }, 260);

    return () => window.clearTimeout(timer);
  }, [search, searchParams, replaceParams]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    replaceParams(next);
  };

  const filtered = useMemo(() => {
    const matching = products.filter(
      (product) =>
        (!activeCategory || product.category === activeCategory.slug) &&
        matchesQuery(product, search)
    );

    return [...matching].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        case "popular":
        case "featured":
        default:
          return b.popularity - a.popularity;
      }
    });
  }, [activeCategory, products, search, sort]);

  const hasFilters = Boolean(search.trim()) || Boolean(activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="text-[11px] text-ink/45">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">Shop</span>
        {activeCategory && (
          <>
            <span className="mx-2">/</span>
            <span className="text-ink/70">{activeCategory.name}</span>
          </>
        )}
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
            The collection
          </p>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {activeCategory ? activeCategory.name : "All products"}
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink/50">
            {activeCategory
              ? activeCategory.description
              : `${products.length} considered pieces across tech, fashion, accessories and home. Filtered down, never padded out.`}
          </p>
        </div>
        <p className="text-[12px] text-ink/45">
          <span className="font-semibold text-ink/70">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-ink px-4 py-3 text-cream sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream/10 text-[#c8d4b9]">
            <Tag className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cream/35">
              Limited offer
            </p>
            <p className="mt-0.5 text-[12px] font-semibold">
              {`${FEATURED_OFFER.percent}% off orders over SAR ${FEATURED_OFFER.minSubtotal}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 pl-12 sm:pl-0">
          <span className="text-[10px] uppercase tracking-[0.12em] text-cream/35">
            Code
          </span>
          <PromoCode code={FEATURED_OFFER.code} tone="dark" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-line bg-white/40 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-11 flex-1 items-center gap-2.5 rounded-full border border-line bg-cream px-4 transition-colors focus-within:border-ink/40">
            <Search className="h-4 w-4 shrink-0 text-ink/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder="Search by product or category..."
              aria-label="Search products"
              className="h-full w-full bg-transparent text-[13px] text-ink placeholder:text-ink/40 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="grid h-6 w-6 place-items-center rounded-full text-ink/40 transition-colors hover:bg-beige hover:text-ink"
              >
                <Close className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          <label className="relative flex h-11 items-center gap-2 rounded-full border border-line bg-cream px-4 sm:w-[210px]">
            <Sliders className="h-4 w-4 shrink-0 text-ink/40" />
            <span className="sr-only">Sort products</span>
            <select
              value={sort}
              onChange={(event) =>
                updateParam(
                  "sort",
                  event.target.value === "featured" ? null : event.target.value
                )
              }
              className="h-full w-full cursor-pointer appearance-none bg-transparent pr-4 text-[12px] font-medium text-ink focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute right-4 text-[9px] text-ink/45"
            >
              ▾
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateParam("category", null)}
            aria-pressed={!activeCategory}
            className={`rounded-full px-4 py-2 text-[12px] font-medium transition-colors ${
              !activeCategory
                ? "bg-ink text-cream"
                : "border border-line bg-cream text-ink/60 hover:border-ink/30 hover:text-ink"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => updateParam("category", category.slug)}
              aria-pressed={activeCategory?.slug === category.slug}
              className={`rounded-full px-4 py-2 text-[12px] font-medium transition-colors ${
                activeCategory?.slug === category.slug
                  ? "bg-ink text-cream"
                  : "border border-line bg-cream text-ink/60 hover:border-ink/30 hover:text-ink"
              }`}
            >
              {category.name}
            </button>
          ))}

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                router.replace("/shop", { scroll: false });
              }}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium text-ink/45 transition-colors hover:text-ink"
            >
              Clear filters
              <Close className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div
          key={`${activeCategory?.slug ?? "all"}-${sort}-${search.trim()}`}
          className="panel-in mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Reveal>
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/40 px-6 py-20 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-beige text-ink/50">
              <Search className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-heading text-xl font-bold text-ink">
              Nothing matches that search
            </h2>
            <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-ink/50">
              Try a broader term, or clear your filters to see the full
              collection.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                router.replace("/shop", { scroll: false });
              }}
              className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[12px] font-semibold text-cream transition-colors hover:bg-olive"
            >
              Clear filters
            </button>
          </div>
        </Reveal>
      )}
    </div>
  );
}
