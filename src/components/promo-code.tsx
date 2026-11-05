"use client";

import { useState } from "react";
import { Check, Copy } from "./icons";

type PromoCodeProps = {
  code: string;
  tone?: "light" | "dark";
  className?: string;
};

export function PromoCode({
  code,
  tone = "light",
  className = "",
}: PromoCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const field = document.createElement("textarea");
      field.value = code;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy offer code ${code}`}
      className={`group inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
        tone === "dark"
          ? "border-cream/20 bg-cream/5 text-cream hover:border-cream/40 hover:bg-cream/10"
          : "border-line bg-white/60 text-ink hover:border-ink/30 hover:bg-white"
      } ${className}`}
    >
      <span>{code}</span>
      <span
        aria-hidden
        className={`h-3 w-px ${
          tone === "dark" ? "bg-cream/20" : "bg-line"
        }`}
      />
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-olive" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
          <span
            className={tone === "dark" ? "text-cream/55" : "text-ink/45"}
          >
            Copy
          </span>
        </>
      )}
    </button>
  );
}
