import { NextResponse } from "next/server";
import {
  adminEmailAddress,
  isAdminConfigured,
  isAdminOtpRequired,
} from "@/lib/admin-auth";
import {
  getLoginChallenge,
  replaceLoginChallenge,
} from "@/lib/account-server";
import { readJsonBody, readString } from "@/lib/api-request";
import { sendAdminLoginCode } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPIRED =
  "That sign-in request has expired. Enter your password again to start over.";

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
  const adminEmail = adminEmailAddress();

  const existing = challengeId ? await getLoginChallenge(challengeId) : null;
  if (
    !existing ||
    existing.email !== adminEmail ||
    existing.purpose !== "admin-login"
  ) {
    return NextResponse.json({ error: EXPIRED }, { status: 400 });
  }

  const challenge = await replaceLoginChallenge(challengeId, "admin-login");
  if (!challenge) {
    return NextResponse.json({ error: EXPIRED }, { status: 400 });
  }

  try {
    const delivery = await sendAdminLoginCode(adminEmail, challenge.code);

    return NextResponse.json({
      ok: true,
      email: adminEmail,
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt,
      emailSent: delivery.delivered,
      devCode: delivery.devCode,
    });
  } catch (error) {
    console.error("Could not resend admin sign-in code", error);
    return NextResponse.json(
      {
        error:
          "We could not send a new code. Check the email delivery settings and try again.",
      },
      { status: 503 },
    );
  }
}
