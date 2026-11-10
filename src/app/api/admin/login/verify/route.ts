import { NextResponse } from "next/server";
import {
  adminEmailAddress,
  isAdminConfigured,
  isAdminOtpRequired,
  setAdminSession,
} from "@/lib/admin-auth";
import { getLoginChallenge, verifyLoginChallenge } from "@/lib/account-server";
import { readJsonBody, readString } from "@/lib/api-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPIRED =
  "That verification code is not valid any more. Start signing in again.";

export async function POST(request: Request) {
  if (!isAdminConfigured() || !isAdminOtpRequired()) {
    return NextResponse.json(
      { error: "Admin verification is not available." },
      { status: 400 },
    );
  }

  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const challengeId = readString(body.challengeId).trim();
  const code = readString(body.code).trim();
  const adminEmail = adminEmailAddress();

  if (!challengeId) {
    return NextResponse.json({ error: EXPIRED }, { status: 400 });
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Enter the 6-digit code from the email.", field: "code" },
      { status: 400 },
    );
  }

  const challenge = await getLoginChallenge(challengeId);
  if (
    !challenge ||
    challenge.email !== adminEmail ||
    challenge.purpose !== "admin-login"
  ) {
    return NextResponse.json({ error: EXPIRED }, { status: 400 });
  }

  const verification = await verifyLoginChallenge(
    challengeId,
    adminEmail,
    code,
    "admin-login",
  );

  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.message, field: "code" },
      { status: 400 },
    );
  }

  await setAdminSession(adminEmail);
  return NextResponse.json({ ok: true });
}
