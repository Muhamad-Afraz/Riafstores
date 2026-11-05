import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 sm:py-32">
      <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.24em] text-olive">
        404
      </p>
      <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        This page has moved on.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-ink/50">
        The link may be old, or the product may no longer be part of the edit.
        Try the shop instead.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold text-cream transition-colors hover:bg-olive"
        >
          Browse products
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-white/60"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
