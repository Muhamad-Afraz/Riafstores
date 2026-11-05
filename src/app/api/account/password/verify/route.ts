import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/account";
import {
  findAccountByEmail,
  verifyLoginChallenge,
} from "@/lib/account-server";
import { readJsonBody, readString } from "@/lib/api-request";
import { setPasswordResetSession } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const challengeId = readString(body.challengeId).trim();
  const email = normalizeEmail(readString(body.email));
  const code = readString(body.code).trim();

  if (!challengeId || !email) {
    return NextResponse.json(
      { error: "Your reset request has expired. Please start again." },
      { status: 400 },
    );
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Enter the 6-digit code from your email.", field: "code" },
      { status: 400 },
    );
  }

  const verification = await verifyLoginChallenge(
    challengeId,
    email,
    code,
    "password-reset",
  );

  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.message, field: "code" },
      { status: 400 },
    );
  }

  const account = await findAccountByEmail(email);
  if (!account) {
    return NextResponse.json(
      { error: "We could not find that account. Please start again." },
      { status: 404 },
    );
  }

  await setPasswordResetSession(account.id);

  return NextResponse.json({ ok: true });
}
