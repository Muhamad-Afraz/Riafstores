"use client";

import { useState, type FormEvent } from "react";
import { discountCodes } from "@/lib/offers";
import { formatPrice } from "@/lib/products";
import { Check, Close, Tag } from "./icons";
import { useStore } from "./store";

export function CouponForm() {
  const { appliedCode, coupon, discount, subtotal, applyCoupon, removeCoupon } =
    useStore();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;

    const result = applyCoupon(value);
    setStatus(result);
    if (result.ok) setValue("");
  };

  const handleRemove = () => {
    removeCoupon();
    setStatus(null);
  };

  if (appliedCode && coupon) {
    const remaining = Math.max(0, coupon.minSubtotal - subtotal);

    return (
      <div className="rounded-xl border border-olive/25 bg-olive-soft/70 p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-olive text-cream">
            <Check className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
                {coupon.code}
              </span>
              <span className="text-[10px] font-medium text-olive">
                {coupon.percent}% off
              </span>
            </div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink/55">
              {discount > 0
                ? `You save ${formatPrice(discount)} on this order.`
                : `Add ${formatPrice(remaining)} more to unlock this offer.`}
            </p>
            {status && (
              <p className="mt-1 text-[10px] leading-relaxed text-ink/45">
                {status.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove offer code ${coupon.code}`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink/35 transition-colors hover:bg-white/70 hover:text-ink"
          >
            <Close className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-olive" />
        <label
          htmlFor="offer-code"
          className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45"
        >
          Offer code
        </label>
      </div>

      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          id="offer-code"
          value={value}
          onChange={(event) => {
            setValue(event.target.value.toUpperCase());
            setStatus(null);
          }}
          placeholder="Enter code"
          autoComplete="off"
          spellCheck={false}
          className="h-10 min-w-0 flex-1 rounded-full border border-line bg-cream px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/30 focus:border-ink/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="h-10 shrink-0 rounded-full bg-ink px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-40"
        >
          Apply
        </button>
      </form>

      {status && (
        <p
          role="status"
          className={`mt-2 text-[10px] leading-relaxed ${
            status.ok ? "text-olive" : "text-ink/55"
          }`}
        >
          {status.message}
        </p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] text-ink/40">
        <span>Try</span>
        {discountCodes.map((entry) => (
          <button
            key={entry.code}
            type="button"
            onClick={() => {
              setValue(entry.code);
              setStatus(null);
            }}
            className="rounded-full border border-line bg-white/50 px-2 py-0.5 font-semibold uppercase tracking-[0.1em] text-ink/55 transition-colors hover:border-ink/25 hover:text-ink"
          >
            {entry.code}
          </button>
        ))}
        <span>at checkout too.</span>
      </div>
    </div>
  );
}
