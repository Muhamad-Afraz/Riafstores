import type { Metadata } from "next";
import { CreateAccountForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a RIAF prototype account for a calmer way to keep track of orders and saved pieces.",
};

export default function CreateAccountPage() {
  return (
    <AuthShell
      eyebrow="Join RIAF"
      title="Create your account"
      description="One place for your details, orders and saved pieces."
    >
      <CreateAccountForm />
    </AuthShell>
  );
}
