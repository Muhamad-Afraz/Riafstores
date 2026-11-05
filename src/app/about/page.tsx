import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "@/components/icons";
import { ProductArt } from "@/components/product-art";

export const metadata: Metadata = {
  title: "About",
  description:
    "RIAF is a close edit of considered everyday things. Learn what we look for before an item makes the list.",
};

const standards = [
  {
    title: "Useful first",
    body: "Every piece solves something real. If it only looks good in a photograph, it does not make the edit.",
  },
  {
    title: "Quiet by design",
    body: "Neutral tones, honest materials and shapes that settle into a room rather than shout across it.",
  },
  {
    title: "Built to be kept",
    body: "We favour repairable, durable goods with clear warranties over disposable trends.",
  },
  {
    title: "Fewer, better",
    body: "A short catalogue is deliberate. It keeps decisions calm and lets each product earn its place.",
  },
];

const principles = [
  "Tested in daily use before listing",
  "Clear, plain-language materials",
  "Repair and returns handled simply",
  "No dark patterns at checkout",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="text-[11px] text-ink/45">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">About</span>
      </nav>

      <section className="mt-6 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
            Our story
          </p>
          <h1 className="mt-3 max-w-xl font-heading text-[clamp(2.6rem,6vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-ink">
            Fewer things,
            <br />
            chosen better.
          </h1>
          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-ink/60">
            RIAF began with a simple frustration: too much to scroll through,
            too little worth keeping. We built a marketplace that behaves more
            like a good shop — a close edit of tech, fashion, accessories and
            home objects, chosen with the same care we would use for ourselves.
          </p>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink/60">
            The earbuds came first because sound is where small details matter
            most. Everything that followed had to meet the same bar.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold text-cream transition-colors hover:bg-olive"
            >
              Shop the edit
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-white/60"
            >
              Get in touch
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-line bg-beige">
          <ProductArt
            art="earbuds"
            tone="beige"
            title="RIAF Buds Pro in Limestone"
            className="aspect-[5/4] h-full w-full"
          />
        </div>
      </section>

      <section id="standards" className="mt-16 scroll-mt-28 border-t border-line pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
              How we choose
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Our standards
            </h2>
          </div>
          <p className="max-w-sm text-[12px] leading-relaxed text-ink/45">
            Four rules guide every category, from earbuds to linen throws.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {standards.map((standard, index) => (
            <div
              key={standard.title}
              className="rounded-2xl border border-line bg-white/40 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-olive-soft font-heading text-[11px] font-bold text-olive">
                  0{index + 1}
                </span>
                <h3 className="font-heading text-[15px] font-bold text-ink">
                  {standard.title}
                </h3>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
                {standard.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 rounded-2xl bg-ink p-6 text-cream sm:grid-cols-[1.2fr_1fr] sm:p-8">
          <div>
            <h3 className="font-heading text-2xl font-extrabold tracking-tight">
              The short version
            </h3>
            <p className="mt-2 max-w-md text-[12px] leading-relaxed text-cream/55">
              Fewer products, better support, and no pressure to buy more than
              you need. That is the whole idea.
            </p>
          </div>
          <ul className="space-y-2.5">
            {principles.map((principle) => (
              <li
                key={principle}
                className="flex items-start gap-2 text-[12px] text-cream/70"
              >
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-cream/10">
                  <Check className="h-2.5 w-2.5" />
                </span>
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="journal" className="mt-16 scroll-mt-28 border-t border-line pt-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
              Journal
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Notes from the edit
            </h2>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink/55">
              We publish sparingly: what we are testing, what we changed our
              minds about, and the occasional guide to buying less but better.
            </p>
            <Link
              href="/help#contact"
              className="group mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink/65 transition-colors hover:text-ink"
            >
              Suggest something we should test
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                tag: "Sound",
                title: "Why 42 dB is the useful kind of quiet",
                note: "A short note on noise cancelling.",
              },
              {
                tag: "Materials",
                title: "The case for heavyweight cotton",
                note: "How our hoodie earned its weight.",
              },
            ].map((article) => (
              <div
                key={article.title}
                className="rounded-2xl border border-line bg-white/40 p-5"
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-olive">
                  {article.tag}
                </p>
                <h3 className="mt-2 font-heading text-[15px] font-bold leading-snug text-ink">
                  {article.title}
                </h3>
                <p className="mt-2 text-[11px] text-ink/45">{article.note}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-ink/30">
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
