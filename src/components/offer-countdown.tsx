"use client";

import { useEffect, useState } from "react";
import { nextOfferDeadline } from "@/lib/offers";

function getParts(remaining: number) {
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [days, hours, minutes, seconds].map((value) =>
    String(value).padStart(2, "0")
  );
}

const labels = ["Days", "Hours", "Mins", "Secs"];

export function OfferCountdown({ className = "" }: { className?: string }) {
  const [deadline] = useState(() => nextOfferDeadline());
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () =>
      setRemaining(Math.max(0, deadline.getTime() - Date.now()));

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [deadline]);

  const parts = remaining === null ? ["00", "00", "00", "00"] : getParts(remaining);

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      aria-label="Offer countdown"
    >
      {parts.map((part, index) => (
        <div key={labels[index]} className="flex items-center gap-1.5">
          <div className="min-w-[46px] rounded-xl border border-cream/10 bg-cream/[0.06] px-2 py-1.5 text-center">
            <span className="block font-heading text-[15px] font-bold text-cream">
              {part}
            </span>
            <span className="mt-0.5 block text-[8px] uppercase tracking-[0.16em] text-cream/35">
              {labels[index]}
            </span>
          </div>
          {index < parts.length - 1 && (
            <span aria-hidden className="text-[11px] text-cream/20">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
