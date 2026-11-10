import type { Metadata } from "next";
import Link from "next/link";
import {
  CardIcon,
  ChevronDown,
  Refresh,
  Shield,
  Truck,
  User,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Shipping, returns, FAQs, account help and contact details for RIAF orders.",
};

const sections = [
  { id: "shipping", label: "Shipping & delivery" },
  { id: "returns", label: "Returns & exchanges" },
  { id: "faqs", label: "FAQs" },
  { id: "account", label: "Account" },
  { id: "contact", label: "Contact" },
  { id: "privacy", label: "Privacy" },
  { id: "terms", label: "Terms" },
];

const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery arrives in 3-5 working days and is free on orders over SAR 75. Express delivery arrives in 1-2 working days for SAR 12. Every order includes tracking.",
  },
  {
    question: "Can I change or cancel an order?",
    answer:
      "If your order has not shipped, contact us and we will do our best to update it. Once dispatched, you can use our 30-day returns process instead.",
  },
  {
    question: "Are the earbuds compatible with my phone?",
    answer:
      "All Riaf earbuds connect over Bluetooth 5.3 and work with iOS, Android, Windows and macOS. Multipoint is available on Buds Pro and Studio ANC.",
  },
  {
    question: "How do I clean my earbuds?",
    answer:
      "Wipe the buds with a soft, dry cloth and use a dry brush for the mesh. Do not use alcohol or run the charging case under water.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "We currently ship to the UK, US, Canada, Australia and selected EU countries. Duties and taxes are calculated at checkout where applicable.",
  },
  {
    question: "What does the warranty cover?",
    answer:
      "Our two-year warranty covers manufacturing faults and hardware failures under normal use. It does not cover accidental damage or normal wear.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="text-[11px] text-ink/45">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">Help</span>
      </nav>

      <div className="mt-5 max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
          Support
        </p>
        <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Help & support
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-ink/55">
          Straight answers on delivery, returns and care. If something is still
          unclear, our small team is easy to reach.
        </p>
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Help sections"
          className="top-28 h-fit rounded-2xl border border-line bg-white/40 p-2 lg:sticky"
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-xl px-3 py-2.5 text-[12px] font-medium text-ink/55 transition-colors hover:bg-beige/60 hover:text-ink"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="space-y-4">
          <section
            id="shipping"
            className="scroll-mt-28 rounded-2xl border border-line bg-white/45 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-beige text-ink/60">
                <Truck className="h-4 w-4" />
              </span>
              <h2 className="font-heading text-xl font-bold text-ink">
                Shipping & delivery
              </h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-cream p-4">
                <p className="text-[12px] font-semibold text-ink">
                  Standard delivery
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink/50">
                  3-5 working days. Free over SAR 75, otherwise SAR 6. Tracked.
                </p>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <p className="text-[12px] font-semibold text-ink">
                  Express delivery
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink/50">
                  1-2 working days. SAR 12 flat. Tracked and signed where possible.
                </p>
              </div>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-ink/45">
              Orders placed before 2pm on a working day are dispatched the same
              day. You will receive a tracking link by email as soon as your
              parcel leaves us.
            </p>
          </section>

          <section
            id="returns"
            className="scroll-mt-28 rounded-2xl border border-line bg-white/45 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-beige text-ink/60">
                <Refresh className="h-4 w-4" />
              </span>
              <h2 className="font-heading text-xl font-bold text-ink">
                Returns & exchanges
              </h2>
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-ink/55">
              You have 30 days from delivery to return unused items in their
              original packaging. Returns are free within the UK and US. Start a
              return by contacting us with your order number.
            </p>
            <ul className="mt-4 space-y-2 text-[12px] text-ink/55">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-olive" />
                Refunds are issued to the original payment method within 5
                working days of inspection.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-olive" />
                Exchanges are subject to stock and are processed as a return
                plus a new order.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-olive" />
                For hygiene reasons, opened ear tips cannot be returned.
              </li>
            </ul>
          </section>

          <section
            id="faqs"
            className="scroll-mt-28 rounded-2xl border border-line bg-white/45 p-5 sm:p-6"
          >
            <h2 className="font-heading text-xl font-bold text-ink">
              Frequently asked
            </h2>
            <div className="mt-3 divide-y divide-line">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold text-ink">
                    {faq.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 pr-6 text-[12px] leading-relaxed text-ink/55">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section
            id="account"
            className="scroll-mt-28 rounded-2xl border border-line bg-white/45 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-beige text-ink/60">
                <User className="h-4 w-4" />
              </span>
              <h2 className="font-heading text-xl font-bold text-ink">
                Your account
              </h2>
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-ink/55">
              Guest checkout is always available. There is no account required
              to shop, track an order or start a return. Saved wishlists and
              carts are stored privately on your device.
            </p>
          </section>

          <section
            id="contact"
            className="scroll-mt-28 rounded-2xl border border-line bg-white/45 p-5 sm:p-6"
          >
            <h2 className="font-heading text-xl font-bold text-ink">
              Contact us
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-ink/55">
              A real person reads every message. Include your order number if
              you have one.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-cream p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                  Email
                </p>
                <a
                  href="mailto:hello@riaf.co"
                  className="mt-1 block text-[12px] font-medium text-ink underline-offset-4 hover:underline"
                >
                  hello@riaf.co
                </a>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                  Hours
                </p>
                <p className="mt-1 text-[12px] font-medium text-ink">
                  Mon-Fri, 9am-5pm
                </p>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                  Response
                </p>
                <p className="mt-1 text-[12px] font-medium text-ink">
                  Within one working day
                </p>
              </div>
            </div>
          </section>

          <section
            id="privacy"
            className="scroll-mt-28 rounded-2xl border border-line bg-white/45 p-5 sm:p-6"
          >
            <h2 className="font-heading text-xl font-bold text-ink">Privacy</h2>
            <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
              We collect only what is needed to fulfil your order and improve
              the shop. Cart and wishlist data stays in your browser. We never
              sell personal data. This demo storefront does not transmit payment
              details.
            </p>
          </section>

          <section
            id="terms"
            className="scroll-mt-28 rounded-2xl border border-line bg-white/45 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-beige text-ink/60">
                <Shield className="h-4 w-4" />
              </span>
              <h2 className="font-heading text-xl font-bold text-ink">
                Terms
              </h2>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
              This is a demonstration storefront. Products, stock, prices and
              delivery options are illustrative. No orders are processed and no
              payments are taken. Full terms would be provided before a live
              launch.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-cream p-3 text-[11px] text-ink/45">
              <CardIcon className="h-4 w-4 shrink-0 text-olive" />
              Checkout is a visual placeholder only.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
