import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Reset password",
  description:
    "Request a one-time code by email to reset your RIAF account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email and we'll send a 6-digit code to reset your password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
