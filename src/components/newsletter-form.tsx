"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-sm">
      <div
        className={`flex items-center gap-2 border-b pb-2 transition-colors ${
          dark
            ? "border-cream/20 focus-within:border-cream/55"
            : "border-ink/20 focus-within:border-ink/55"
        }`}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          className={`w-full bg-transparent text-sm focus:outline-none ${
            dark
              ? "text-cream placeholder:text-cream/35"
              : "text-ink placeholder:text-ink/35"
          }`}
        />
        <button
          type="submit"
          className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
            dark
              ? "text-cream/60 hover:text-cream"
              : "text-ink/55 hover:text-ink"
          }`}
        >
          Join
        </button>
      </div>
      <p
        className={`mt-2 text-[11px] leading-relaxed ${
          dark ? "text-cream/45" : "text-ink/45"
        }`}
      >
        {done
          ? "You are on the list. Welcome to RIAF."
          : "New arrivals and considered edits. No noise."}
      </p>
    </form>
  );
}
