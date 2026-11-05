import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "../icons";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <div className="mx-auto w-full max-w-[460px] px-4 pb-20 pt-10 sm:pt-14">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="RIAF home"
          className="flex items-center gap-2.5"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-heading text-[15px] font-extrabold text-cream">
            R
          </span>
          <span className="font-heading text-[19px] font-extrabold tracking-[0.28em] text-ink">
            RIAF
          </span>
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink/50 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to shop
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white/50 p-6 shadow-[0_24px_60px_-52px_rgba(32,31,28,0.6)] sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-[12px] leading-relaxed text-ink/50">
          {description}
        </p>
        <div className="mt-6">{children}</div>
      </div>

      <p className="mx-auto mt-5 max-w-xs text-center text-[10px] leading-relaxed text-ink/35">
        Account access and password recovery are protected with a one-time code
        sent to your email. Google sign-in is available when it has been
        configured for this store.
      </p>
    </div>
  );
}
