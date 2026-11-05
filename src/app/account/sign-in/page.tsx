import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your RIAF prototype account to view your details, orders and saved pieces.",
};

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Account access"
      title="Welcome back"
      description="Sign in to see your details, orders and saved pieces."
    >
      <SignInForm />
    </AuthShell>
  );
}
