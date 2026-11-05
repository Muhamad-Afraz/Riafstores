"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { categories } from "@/lib/products";
import { AccountMenu } from "./account-menu";
import { Marquee } from "./marquee";
import { useStore } from "./store";
import {
  Bag,
  ChevronDown,
  ChevronRight,
  Close,
  Heart,
  Menu,
  Search,
} from "./icons";

function Logo() {
  return (
    <Link
      href="/"
      aria-label="RIAF home"
      className="flex shrink-0 items-center gap-2.5"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-heading text-[15px] font-extrabold text-cream">
        R
      </span>
      <span className="font-heading text-[19px] font-extrabold tracking-[0.28em] text-ink">
        RIAF
      </span>
    </Link>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-full text-ink/65 transition-colors hover:bg-beige/60 hover:text-ink"
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, wishlist, catalog } = useStore();
  const [query, setQuery] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const countByCategory = (slug: string) =>
    catalog.filter((product) => product.category === slug).length;

  useEffect(() => {
    setCategoriesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
    setMobileOpen(false);
    setCategoriesOpen(false);
  };

  const shopActive = pathname === "/shop" || pathname.startsWith("/product/");
  const linkClass = (active: boolean) =>
    `relative py-2 text-[13px] font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-olive after:transition-all after:duration-300 ${
      active
        ? "text-ink after:w-full"
        : "text-ink/60 after:w-0 hover:text-ink hover:after:w-full"
    }`;

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink py-2 text-[10px] uppercase tracking-[0.16em] text-cream/65">
        <Marquee
          className="mask-fade-x"
          duration={44}
          items={[
            "Free shipping over $75",
            "Limited offer: 15% off orders over $100 with code RIAF15",
            "30-day returns, no questions asked",
            "2-year warranty on every piece",
            "New season, fewer but better things",
          ]}
        />
      </div>

      <div className="border-b border-line bg-cream/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="hidden h-[72px] items-center gap-7 lg:flex">
            <Logo />

            <nav aria-label="Primary" className="flex items-center gap-6">
              <Link href="/" className={linkClass(pathname === "/")}>
                Home
              </Link>
              <Link href="/shop" className={linkClass(shopActive)}>
                Shop
              </Link>
              <Link href="/#offer" className={linkClass(false)}>
                Offers
              </Link>
              <div
                className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setCategoriesOpen((value) => !value)}
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 py-2 text-[13px] font-medium transition-colors ${
                    categoriesOpen ? "text-ink" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  Categories
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      categoriesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {categoriesOpen && (
                  <div className="absolute left-0 top-full pt-3">
                    <div className="panel-in w-[430px] rounded-2xl border border-line bg-cream p-2 shadow-[0_30px_70px_-40px_rgba(32,31,28,0.6)]">
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/shop?category=${category.slug}`}
                          className="group flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-beige/50"
                        >
                          <span>
                            <span className="block font-heading text-[13px] font-bold text-ink">
                              {category.name}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-ink/50">
                      {catalog.filter(
                        (product) => product.category === category.slug
                      ).length}{" "}
                      products
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-ink/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink/60" />
                        </Link>
                      ))}
                      <Link
                        href="/shop"
                        className="mt-1 flex items-center justify-between rounded-xl bg-ink px-3 py-2.5 text-[12px] font-medium text-cream transition-colors hover:bg-olive"
                      >
                        View all products
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <form
              onSubmit={submitSearch}
              role="search"
              className="ml-auto flex h-10 w-full max-w-[330px] items-center gap-2 rounded-full border border-line bg-white/60 px-4 transition-colors focus-within:border-ink/40 focus-within:bg-white"
            >
              <Search className="h-4 w-4 shrink-0 text-ink/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search products, categories..."
                aria-label="Search products"
                className="h-full w-full bg-transparent text-[13px] text-ink placeholder:text-ink/40 focus:outline-none"
              />
            </form>

            <div className="flex items-center gap-0.5">
              <IconLink href="/wishlist" label="Wishlist">
                <span className="relative">
                  <Heart className="h-[18px] w-[18px]" />
                  {wishlist.length > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-olive px-1 text-[9px] font-semibold text-cream">
                      {wishlist.length}
                    </span>
                  )}
                </span>
              </IconLink>
              <AccountMenu />
              <Link
                href="/cart"
                aria-label={`Cart, ${count} items`}
                className="relative flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium text-cream transition-colors hover:bg-olive"
              >
                <Bag className="h-[17px] w-[17px]" />
                <span className="hidden xl:inline">Cart</span>
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-cream/15 px-1 text-[10px] font-semibold">
                  {count}
                </span>
              </Link>
            </div>
          </div>

          <div className="flex h-16 items-center justify-between lg:hidden">
            <Logo />
            <div className="flex items-center gap-1">
              <Link
                href="/cart"
                aria-label={`Cart, ${count} items`}
                className="relative grid h-10 w-10 place-items-center rounded-full text-ink/70 transition-colors hover:bg-beige/60 hover:text-ink"
              >
                <Bag className="h-[19px] w-[19px]" />
                <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-olive px-1 text-[9px] font-semibold text-cream">
                  {count}
                </span>
              </Link>
              <AccountMenu variant="mobile" />
              <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="grid h-10 w-10 place-items-center rounded-full text-ink/70 transition-colors hover:bg-beige/60 hover:text-ink"
              >
                {mobileOpen ? (
                  <Close className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <form
            onSubmit={submitSearch}
            role="search"
            className="mb-3 flex h-10 items-center gap-2 rounded-full border border-line bg-white/60 px-4 lg:hidden"
          >
            <Search className="h-4 w-4 shrink-0 text-ink/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              className="h-full w-full bg-transparent text-[13px] text-ink placeholder:text-ink/40 focus:outline-none"
            />
          </form>
        </div>

        {mobileOpen && (
          <div
            id="mobile-menu"
            className="max-h-[calc(100vh-8rem)] overflow-y-auto border-t border-line bg-cream lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
              <nav aria-label="Mobile" className="flex flex-col">
                {[
                  { label: "Home", href: "/" },
                  { label: "Shop all", href: "/shop" },
                  { label: "Offers", href: "/#offer" },
                  { label: "Wishlist", href: "/wishlist" },
                  { label: "Cart", href: "/cart" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between border-b border-line/70 py-3 font-heading text-[15px] font-semibold text-ink"
                  >
                    {link.label}
                    <ChevronRight className="h-4 w-4 text-ink/30" />
                  </Link>
                ))}
              </nav>

              <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-ink/40">
                Categories
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/shop?category=${category.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl border border-line bg-white/50 px-3 py-3"
                  >
                    <span className="block font-heading text-[13px] font-semibold text-ink">
                      {category.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink/45">
                      {catalog.filter(
                        (product) => product.category === category.slug
                      ).length}{" "}
                      products
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
