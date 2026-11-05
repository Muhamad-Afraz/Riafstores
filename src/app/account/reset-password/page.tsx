import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";
import { getPasswordResetAccountId } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your RIAF account.",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const accountId = await getPasswordResetAccountId();

  if (!accountId) {
    redirect("/account/forgot-password");
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Your email is verified. Set a new password for your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
