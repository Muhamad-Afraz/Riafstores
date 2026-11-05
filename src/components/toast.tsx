"use client";

import { useEffect } from "react";
import { useStore } from "./store";
import { Check } from "./icons";

export function Toast() {
  const { notice, clearNotice } = useStore();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(clearNotice, 2800);
    return () => window.clearTimeout(timer);
  }, [notice, clearNotice]);

  if (!notice) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4"
    >
      <div
        key={notice.id}
        className="toast-in flex items-center gap-2.5 rounded-full border border-ink/10 bg-ink px-4 py-2.5 text-[13px] font-medium text-cream shadow-[0_18px_40px_-20px_rgba(32,31,28,0.8)]"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-olive text-cream">
          <Check className="h-3 w-3" />
        </span>
        {notice.message}
      </div>
    </div>
  );
}
