import Link from "next/link";
import { categories } from "@/lib/products";
import { NewsletterForm } from "./newsletter-form";

const supportLinks = [
  { label: "Help & Support", href: "/help" },
  { label: "Shipping & Delivery", href: "/help#shipping" },
  { label: "Returns & Exchanges", href: "/help#returns" },
  { label: "Contact Us", href: "/help#contact" },
];

const aboutLinks = [
  { label: "Our Story", href: "/about" },
  { label: "Privacy Policy", href: "/help#privacy" },
  { label: "Terms & Conditions", href: "/help#terms" },
];

const linkClass =
  "inline-block text-[12px] text-cream/60 transition-colors hover:text-cream hover:underline hover:underline-offset-4 hover:decoration-cream/30";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-12 sm:px-8 sm:pt-14">
        <div className="grid gap-10 border-b border-cream/10 pb-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <Link
              href="/"
              aria-label="RIAF home"
              className="inline-flex items-center gap-2.5"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-cream/30 font-heading text-[14px] font-extrabold text-cream">
                R
              </span>
              <span className="font-heading text-[18px] font-extrabold tracking-[0.28em] text-cream">
                RIAF
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-cream/55">
              Thoughtfully selected, quietly useful. A close edit of things
              made for every day.
            </p>
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/40">
                Join the private list
              </p>
              <NewsletterForm dark />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/40">
                Shop
              </p>
              <ul className="mt-3 space-y-1.5">
                <li>
                  <Link href="/shop" className={linkClass}>
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/#offer" className={linkClass}>
                    Limited Offers
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      className={linkClass}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/wishlist" className={linkClass}>
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/40">
                Support
              </p>
              <ul className="mt-3 space-y-1.5">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/40">
                About
              </p>
              <ul className="mt-3 space-y-1.5">
                {aboutLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-cream/35">
            © 2026 RIAF. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"].map(
              (method) => (
                <span
                  key={method}
                  className="rounded-md border border-cream/10 px-2 py-1 text-[9px] font-medium tracking-[0.08em] text-cream/40"
                >
                  {method}
                </span>
              )
            )}
          </div>
        </div>

        <p
          aria-hidden
          className="pointer-events-none mt-8 select-none whitespace-nowrap text-center font-heading text-[clamp(5rem,19vw,15rem)] font-extrabold leading-[0.72] tracking-[0.08em] text-cream/[0.045]"
        >
          RIAF
        </p>
      </div>
    </footer>
  );
}
