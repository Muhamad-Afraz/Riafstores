"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Shield } from "@/components/icons";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-cream px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/40";
const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45";

export function AdminLogin({ configured = true }: { configured?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to sign in.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to sign in.",
      );
      setPending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 pb-20 pt-16 sm:px-6">
      <div className="rounded-[24px] border border-line bg-white/55 p-6 sm:p-8">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-cream">
          <Shield className="h-5 w-5" />
        </span>
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
          RIAF Admin
        </p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink">
          Sign in
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink/55">
          Product changes made here are saved to the store database and appear
          on the live site for every visitor.
        </p>

        {!configured && (
          <p className="mt-5 rounded-xl border border-ink/15 bg-beige/70 px-4 py-3 text-[12px] leading-relaxed text-ink/70">
            Admin login is not configured. Set <code>ADMIN_EMAIL</code>,{" "}
            <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> in
            your environment and redeploy.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label htmlFor="admin-email" className={labelClass}>
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@riaf.co"
              className={inputClass}
              required
            />
          </div>

          <div className="mt-4">
            <label htmlFor="admin-password" className={labelClass}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={inputClass}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-ink/15 bg-beige/70 px-4 py-3 text-[12px] text-ink/70"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !configured}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in"}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
