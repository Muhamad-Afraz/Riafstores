import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/account";
import {
  getLoginChallenge,
  replaceLoginChallenge,
} from "@/lib/account-server";
import { readJsonBody, readString } from "@/lib/api-request";
import { sendPasswordResetCode } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const challengeId = readString(body.challengeId).trim();
  const email = normalizeEmail(readString(body.email));

  if (!challengeId || !email) {
    return NextResponse.json(
      { error: "Your reset request has expired. Please start again." },
      { status: 400 },
    );
  }

  const existing = await getLoginChallenge(challengeId);
  if (
    !existing ||
    existing.email !== email ||
    existing.purpose !== "password-reset"
  ) {
    return NextResponse.json(
      { error: "Your reset request has expired. Please start again." },
      { status: 400 },
    );
  }

  const challenge = await replaceLoginChallenge(
    challengeId,
    "password-reset",
  );
  if (!challenge) {
    return NextResponse.json(
      { error: "Your reset request has expired. Please start again." },
      { status: 400 },
    );
  }

  try {
    const delivery = await sendPasswordResetCode(email, challenge.code);

    return NextResponse.json({
      ok: true,
      email,
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt,
      emailSent: delivery.delivered,
      devCode: delivery.devCode,
    });
  } catch (error) {
    console.error("Could not resend password reset code", error);
    return NextResponse.json(
      {
        error:
          "We could not send a new reset code. Email delivery is not configured on this server.",
      },
      { status: 503 },
    );
  }
}
