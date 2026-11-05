import { NextResponse } from "next/server";
import { toPublicAccount } from "@/lib/account-server";
import { getSessionAccount } from "@/lib/auth-session";
import { isEmailDeliveryConfigured } from "@/lib/mailer";
import { isGoogleConfigured } from "@/lib/google-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const account = await getSessionAccount();

  return NextResponse.json(
    {
      user: account ? toPublicAccount(account) : null,
      providers: {
        google: isGoogleConfigured(),
        email: isEmailDeliveryConfigured(),
      },
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
