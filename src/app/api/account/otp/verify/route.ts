import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/account";
import {
  findAccountByEmail,
  toPublicAccount,
  verifyLoginChallenge,
} from "@/lib/account-server";
import { readBoolean, readJsonBody, readString } from "@/lib/api-request";
import { setAccountSession } from "@/lib/auth-session";

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
  const remember = readBoolean(body.remember, true);

  if (!challengeId || !email) {
    return NextResponse.json(
      { error: "Your sign-in request has expired. Please start again." },
      { status: 400 },
    );
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Enter the 6-digit code from your email.", field: "code" },
      { status: 400 },
    );
  }

  const verification = await verifyLoginChallenge(challengeId, email, code);
  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.message, field: "code" },
      { status: 400 },
    );
  }

  const account = await findAccountByEmail(email);
  if (!account) {
    return NextResponse.json(
      { error: "The email or password you entered is incorrect." },
      { status: 401 },
    );
  }

  await setAccountSession(account.id, remember);

  return NextResponse.json({ ok: true, user: toPublicAccount(account) });
}
