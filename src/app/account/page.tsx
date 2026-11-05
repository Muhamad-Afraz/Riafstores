import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountDashboard } from "@/components/account-dashboard";

export const metadata: Metadata = {
  title: "My account",
  description:
    "View your RIAF profile, orders, saved pieces and account settings.",
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
          <div className="h-3 w-24 animate-pulse rounded-full bg-beige" />
          <div className="mt-3 h-9 w-64 animate-pulse rounded-xl bg-beige" />
          <div className="mt-8 grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
            <div className="h-64 animate-pulse rounded-2xl border border-line bg-white/40" />
            <div className="h-96 animate-pulse rounded-2xl border border-line bg-white/40" />
          </div>
        </div>
      }
    >
      <AccountDashboard />
    </Suspense>
  );
}
