"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
} from "@/lib/account";
import { useAuth } from "../auth";
import { Shield } from "../icons";
import { useStore } from "../store";
import {
  authErrorClass,
  authInputClass,
  authLabelClass,
  authSubmitClass,
} from "./auth-styles";
import { GoogleButton } from "./google-button";
import { PasswordField } from "./password-field";

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "email";
  maxLength?: number;
};

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
  maxLength,
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className={authLabelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${authInputClass} ${error ? "border-ink/50" : ""}`}
      />
      {error && (
        <p id={errorId} className={authErrorClass}>
          {error}
        </p>
      )}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-[10px] uppercase tracking-[0.18em] text-ink/35">
        or
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function FormError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="rounded-xl border border-ink/10 bg-beige/60 px-3 py-2.5 text-[11px] leading-relaxed text-ink/70"
    >
      {message}
    </p>
  );
}

const GOOGLE_ERRORS: Record<string, string> = {
  google_not_configured:
    "Google sign-in is not configured on this server yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  google_cancelled: "Google sign-in was cancelled.",
  google_failed: "Google sign-in could not be completed. Please try again.",
  google_email_unverified:
    "Google did not confirm that this email address is verified.",
  google_account_conflict:
    "An account already exists for this email. Sign in with your password instead.",
};

type Challenge = {
  challengeId: string;
  email: string;
  expiresAt: string;
  emailSent: boolean;
  devCode?: string;
};

function challengeNotice(challenge: Challenge) {
  if (challenge.devCode) {
    return `Development mode: email delivery is not configured, so use this code: ${challenge.devCode}`;
  }

  if (challenge.emailSent) {
    return `We sent a 6-digit code to ${challenge.email}. It expires in 10 minutes.`;
  }

  return `A 6-digit sign-in code was created for ${challenge.email}.`;
}

export function SignInForm() {
  const router = useRouter();
  const { signIn, verifyOtp, resendOtp, providers } = useAuth();
  const { notify } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [notice, setNotice] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const reset = params.get("reset");

    if (error) {
      setFormError(
        GOOGLE_ERRORS[error] ??
          "Sign-in could not be completed. Please try again.",
      );
      params.delete("error");
    }

    if (reset === "success") {
      setSuccessMessage(
        "Your password has been updated. Sign in with your new password.",
      );
      params.delete("reset");
    }

    if (!error && reset !== "success") return;

    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const next: { email?: string; password?: string } = {};

    if (!email.trim()) {
      next.email = "Enter your email address.";
    } else if (!isValidEmail(email)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Enter your password.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const result = await signIn(email, password, remember);

    if (!result.ok) {
      if (result.field === "email") {
        setErrors((current) => ({
          ...current,
          email: result.message,
        }));
      } else if (result.field === "password") {
        setErrors((current) => ({
          ...current,
          password: result.message,
        }));
      } else {
        setFormError(result.message);
      }

      setSubmitting(false);
      return;
    }

    if ("otpRequired" in result) {
      const nextChallenge: Challenge = {
        challengeId: result.challengeId,
        email: result.email,
        expiresAt: result.expiresAt,
        emailSent: result.emailSent,
        devCode: result.devCode,
      };

      setChallenge(nextChallenge);
      setNotice(challengeNotice(nextChallenge));
      setOtp("");
      setOtpError("");
      setStep("otp");
      setSubmitting(false);
      return;
    }

    notify("Signed in successfully.");
    router.push("/account");
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challenge) return;

    setFormError("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    const result = await verifyOtp(
      challenge.challengeId,
      challenge.email,
      otp.trim(),
      remember,
    );

    if (!result.ok) {
      if (result.field === "code") {
        setOtpError(result.message);
      } else {
        setFormError(result.message);
      }

      setSubmitting(false);
      return;
    }

    notify("Signed in successfully.");
    router.push("/account");
  };

  const handleResend = async () => {
    if (!challenge) return;

    setFormError("");
    setResending(true);
    const result = await resendOtp(challenge.challengeId, challenge.email);
    setResending(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    const nextChallenge: Challenge = {
      challengeId: result.challengeId,
      email: result.email,
      expiresAt: result.expiresAt,
      emailSent: result.emailSent,
      devCode: result.devCode,
    };

    setChallenge(nextChallenge);
    setNotice(challengeNotice(nextChallenge));
    setOtp("");
    setOtpError("");
  };

  const resetToCredentials = () => {
    setStep("credentials");
    setChallenge(null);
    setOtp("");
    setOtpError("");
    setNotice("");
    setFormError("");
  };

  const startGoogle = () => {
    // Let the server decide whether Google is configured. It redirects back
    // with ?error=google_not_configured when the env vars are missing, which
    // avoids showing a stale "not configured" message on an old page load.
    window.location.assign("/api/account/google/start");
  };

  if (step === "otp" && challenge) {
    return (
      <div>
        <div className="rounded-xl border border-line bg-beige/55 p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-beige text-ink/55">
              <Shield className="h-3.5 w-3.5" />
            </span>
            <p className="text-[12px] font-semibold text-ink">
              Check your email
            </p>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink/55">
            {notice}
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          noValidate
          className="mt-5 space-y-4"
          aria-label="Verify sign-in code"
        >
          <TextField
            id="signin-otp"
            label="6-digit code"
            value={otp}
            onChange={(value) => {
              setOtp(value.replace(/\D/g, "").slice(0, 6));
              setOtpError("");
              setFormError("");
            }}
            error={otpError}
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
          />

          <FormError message={formError} />

          <button
            type="submit"
            className={authSubmitClass}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Verifying…" : "Verify and sign in"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-[11px] font-medium text-ink/55 underline-offset-4 transition-colors hover:text-ink hover:underline disabled:opacity-50"
          >
            {resending ? "Sending a new code…" : "Resend code"}
          </button>
          <button
            type="button"
            onClick={resetToCredentials}
            className="text-[11px] font-medium text-ink/55 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-olive/20 bg-beige/60 px-3 py-2.5 text-[11px] leading-relaxed text-ink/70"
        >
          {successMessage}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
        aria-label="Sign in"
      >
        <TextField
          id="signin-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setFormError("");
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
        />

        <PasswordField
          id="signin-password"
          label="Password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setFormError("");
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Enter your password"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-ink/60">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-line accent-olive"
            />
            Remember me
          </label>
          <Link
            href="/account/forgot-password"
            className="text-[11px] font-medium text-ink/55 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {providers && !providers.email && (
          <p className="rounded-xl bg-beige/50 px-3 py-2.5 text-[10px] leading-relaxed text-ink/45">
            Email delivery is not configured. In development, the sign-in code
            will be shown on this page after you enter your password.
          </p>
        )}

        <FormError message={formError} />

        <button
          type="submit"
          className={authSubmitClass}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Checking details…" : "Continue"}
        </button>
      </form>

      <Divider />

      <GoogleButton onClick={startGoogle} />

      <p className="mt-6 text-center text-[12px] text-ink/50">
        New to RIAF?{" "}
        <Link
          href="/account/create-account"
          className="font-semibold text-ink underline-offset-4 transition-colors hover:text-olive hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function CreateAccountForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { notify } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const next: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!isValidName(name)) {
      next.name = "Enter your full name.";
    }

    if (!email.trim()) {
      next.email = "Enter your email address.";
    } else if (!isValidEmail(email)) {
      next.email = "Enter a valid email address.";
    }

    if (!isValidPassword(password)) {
      next.password = "Use at least 8 characters.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Confirm your password.";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const result = await register(name, email, password);

    if (!result.ok) {
      if (
        result.field === "name" ||
        result.field === "email" ||
        result.field === "password"
      ) {
        const field = result.field;
        setErrors((current) => ({
          ...current,
          [field]: result.message,
        }));
      } else {
        setFormError(result.message);
      }

      setSubmitting(false);
      return;
    }

    notify("Account created. Welcome to RIAF.");
    router.push("/account");
  };

  const startGoogle = () => {
    window.location.assign("/api/account/google/start");
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
        aria-label="Create account"
      >
        <TextField
          id="create-name"
          label="Full name"
          value={name}
          onChange={(value) => {
            setName(value);
            setFormError("");
            setErrors((current) => ({ ...current, name: undefined }));
          }}
          error={errors.name}
          autoComplete="name"
          placeholder="Your full name"
        />

        <TextField
          id="create-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setFormError("");
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
        />

        <PasswordField
          id="create-password"
          label="Password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setFormError("");
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          error={errors.password}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />

        <PasswordField
          id="create-confirm-password"
          label="Confirm password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            setFormError("");
            setErrors((current) => ({
              ...current,
              confirmPassword: undefined,
            }));
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Repeat your password"
        />

        <FormError message={formError} />

        <button
          type="submit"
          className={authSubmitClass}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <Divider />

      <GoogleButton onClick={startGoogle} />

      <p className="mt-6 text-center text-[12px] text-ink/50">
        Already have an account?{" "}
        <Link
          href="/account/sign-in"
          className="font-semibold text-ink underline-offset-4 transition-colors hover:text-olive hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function resetChallengeNotice(challenge: Challenge) {
  if (challenge.devCode) {
    return `Development mode: email delivery is not configured, so use this code: ${challenge.devCode}`;
  }

  if (challenge.emailSent) {
    return `We sent a 6-digit reset code to ${challenge.email}. It expires in 10 minutes.`;
  }

  return `A 6-digit reset code was created for ${challenge.email}.`;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const { forgotPassword, resendPasswordReset, verifyPasswordReset, providers } =
    useAuth();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<"email" | "otp">("email");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [notice, setNotice] = useState("");
  const [resending, setResending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!email.trim()) {
      setEmailError("Enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError("");
    setSubmitting(true);
    const result = await forgotPassword(email.trim());

    if (!result.ok) {
      if (result.field === "email") {
        setEmailError(result.message);
      } else {
        setFormError(result.message);
      }

      setSubmitting(false);
      return;
    }

    const nextChallenge: Challenge = {
      challengeId: result.challengeId,
      email: result.email,
      expiresAt: result.expiresAt,
      emailSent: result.emailSent,
      devCode: result.devCode,
    };

    setChallenge(nextChallenge);
    setNotice(resetChallengeNotice(nextChallenge));
    setOtp("");
    setOtpError("");
    setStep("otp");
    setSubmitting(false);
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challenge) return;

    setFormError("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    const result = await verifyPasswordReset(
      challenge.challengeId,
      challenge.email,
      otp.trim(),
    );

    if (!result.ok) {
      if (result.field === "code") {
        setOtpError(result.message);
      } else {
        setFormError(result.message);
      }

      setSubmitting(false);
      return;
    }

    router.push("/account/reset-password");
  };

  const handleResend = async () => {
    if (!challenge) return;

    setFormError("");
    setResending(true);
    const result = await resendPasswordReset(
      challenge.challengeId,
      challenge.email,
    );
    setResending(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    const nextChallenge: Challenge = {
      challengeId: result.challengeId,
      email: result.email,
      expiresAt: result.expiresAt,
      emailSent: result.emailSent,
      devCode: result.devCode,
    };

    setChallenge(nextChallenge);
    setNotice(resetChallengeNotice(nextChallenge));
    setOtp("");
    setOtpError("");
  };

  const useAnotherEmail = () => {
    setStep("email");
    setChallenge(null);
    setOtp("");
    setOtpError("");
    setNotice("");
    setFormError("");
  };

  if (step === "otp" && challenge) {
    return (
      <div>
        <div className="rounded-xl border border-line bg-beige/55 p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-beige text-ink/55">
              <Shield className="h-3.5 w-3.5" />
            </span>
            <p className="text-[12px] font-semibold text-ink">
              Check your email
            </p>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink/55">
            {notice}
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          noValidate
          className="mt-5 space-y-4"
          aria-label="Verify reset code"
        >
          <TextField
            id="reset-otp"
            label="6-digit code"
            value={otp}
            onChange={(value) => {
              setOtp(value.replace(/\D/g, "").slice(0, 6));
              setOtpError("");
              setFormError("");
            }}
            error={otpError}
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
          />

          <FormError message={formError} />

          <button
            type="submit"
            className={authSubmitClass}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Verifying…" : "Verify code"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-[11px] font-medium text-ink/55 underline-offset-4 transition-colors hover:text-ink hover:underline disabled:opacity-50"
          >
            {resending ? "Sending a new code…" : "Resend code"}
          </button>
          <button
            type="button"
            onClick={useAnotherEmail}
            className="text-[11px] font-medium text-ink/55 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
        aria-label="Reset password"
      >
        <TextField
          id="forgot-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setEmailError("");
            setFormError("");
          }}
          error={emailError}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
        />

        {providers && !providers.email && (
          <p className="rounded-xl bg-beige/50 px-3 py-2.5 text-[10px] leading-relaxed text-ink/45">
            Email delivery is not configured. In development, the reset code
            will be shown on this page after you submit your email.
          </p>
        )}

        <FormError message={formError} />

        <button
          type="submit"
          className={authSubmitClass}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Sending code…" : "Send reset code"}
        </button>
      </form>

      <p className="mt-6 text-center text-[12px] text-ink/50">
        Remembered it?{" "}
        <Link
          href="/account/sign-in"
          className="font-semibold text-ink underline-offset-4 transition-colors hover:text-olive hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const next: { password?: string; confirmPassword?: string } = {};

    if (!isValidPassword(password)) {
      next.password = "Use at least 8 characters.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Confirm your password.";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const result = await resetPassword(password);

    if (!result.ok) {
      if (result.field === "password") {
        setErrors((current) => ({ ...current, password: result.message }));
      } else {
        setFormError(result.message);
      }

      setSubmitting(false);
      return;
    }

    router.push("/account/sign-in?reset=success");
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
        aria-label="Choose a new password"
      >
        <PasswordField
          id="reset-password"
          label="New password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setFormError("");
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          error={errors.password}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />

        <PasswordField
          id="reset-confirm-password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            setFormError("");
            setErrors((current) => ({
              ...current,
              confirmPassword: undefined,
            }));
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Repeat your new password"
        />

        <FormError message={formError} />

        <button
          type="submit"
          className={authSubmitClass}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Updating password…" : "Update password"}
        </button>
      </form>

      <p className="mt-4 rounded-xl bg-beige/50 px-3 py-2.5 text-[10px] leading-relaxed text-ink/45">
        After your password is updated you will be signed out and asked to sign
        in again with the new password.
      </p>
    </div>
  );
}
