"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Shield } from "@/components/icons";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-cream px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/40";
const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45";

type Challenge = {
  challengeId: string;
  email: string;
  emailSent: boolean;
  devCode?: string;
};

type ChallengeResponse = {
  error?: string;
  field?: string;
  challengeId?: string;
  email?: string;
  emailSent?: boolean;
  devCode?: string;
  otpRequired?: boolean;
};

function challengeNotice(challenge: Challenge) {
  if (challenge.devCode) {
    return `Development mode: the email could not be delivered, so use this code: ${challenge.devCode}`;
  }

  if (challenge.emailSent) {
    return `We sent a 6-digit code to ${challenge.email}. It expires in 10 minutes.`;
  }

  return `A 6-digit code was created for ${challenge.email}.`;
}

export function AdminLogin({ configured = true }: { configured?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
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
      const data = (await response.json().catch(() => ({}))) as ChallengeResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to sign in.");
      }

      if (data.otpRequired === false) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      if (!data.challengeId) {
        throw new Error("Verification could not be started. Please try again.");
      }

      const next: Challenge = {
        challengeId: data.challengeId,
        email: data.email ?? email,
        emailSent: data.emailSent === true,
        devCode: typeof data.devCode === "string" ? data.devCode : undefined,
      };

      setChallenge(next);
      setNotice(challengeNotice(next));
      setOtp("");
      setOtpError("");
      setStep("otp");
      setPending(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to sign in.",
      );
      setPending(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challenge) return;

    setError(null);

    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("Enter the 6-digit code from the email.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/admin/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.challengeId,
          code: otp.trim(),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as ChallengeResponse;

      if (!response.ok) {
        if (data.field === "code") {
          setOtpError(data.error ?? "That code is incorrect.");
          setPending(false);
          return;
        }

        throw new Error(data.error ?? "Unable to verify the code.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to verify the code.",
      );
      setPending(false);
    }
  };

  const handleResend = async () => {
    if (!challenge) return;

    setError(null);
    setResending(true);

    try {
      const response = await fetch("/api/admin/login/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.challengeId }),
      });
      const data = (await response.json().catch(() => ({}))) as ChallengeResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send a new code.");
      }

      if (!data.challengeId) {
        throw new Error("Verification could not be restarted. Please try again.");
      }

      const next: Challenge = {
        challengeId: data.challengeId,
        email: data.email ?? challenge.email,
        emailSent: data.emailSent === true,
        devCode: typeof data.devCode === "string" ? data.devCode : undefined,
      };

      setChallenge(next);
      setNotice(challengeNotice(next));
      setOtp("");
      setOtpError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to send a new code.",
      );
    } finally {
      setResending(false);
    }
  };

  const backToCredentials = () => {
    setStep("credentials");
    setChallenge(null);
    setOtp("");
    setOtpError("");
    setNotice("");
    setError(null);
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
          {step === "credentials" ? "Sign in" : "Enter your code"}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink/55">
          {step === "credentials"
            ? "Product changes made here are saved to the store database and appear on the live site for every visitor."
            : "For extra security we email a one-time code before opening the admin panel."}
        </p>

        {!configured && (
          <p className="mt-5 rounded-xl border border-ink/15 bg-beige/70 px-4 py-3 text-[12px] leading-relaxed text-ink/70">
            Admin login is not configured. Set <code>ADMIN_EMAIL</code>,{" "}
            <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> in
            your environment and redeploy.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-ink/15 bg-beige/70 px-4 py-3 text-[12px] text-ink/70"
          >
            {error}
          </p>
        )}

        {step === "credentials" ? (
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

            <button
              type="submit"
              disabled={pending || !configured}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Checking..." : "Continue"}
              {!pending && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-6">
            <p className="rounded-xl border border-line bg-beige/50 px-4 py-3 text-[12px] leading-relaxed text-ink/70">
              {notice}
            </p>

            <div className="mt-4">
              <label htmlFor="admin-code" className={labelClass}>
                6-digit code
              </label>
              <input
                id="admin-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setOtpError("");
                }}
                placeholder="000000"
                className={`${inputClass} text-center text-lg tracking-[0.4em]`}
                required
              />
              {otpError && (
                <p className="mt-2 text-[11px] text-red-700">{otpError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Verifying..." : "Verify & sign in"}
              {!pending && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="mt-4 flex items-center justify-between text-[11px] text-ink/55">
              <button
                type="button"
                onClick={backToCredentials}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-medium transition-colors hover:text-ink disabled:opacity-60"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
