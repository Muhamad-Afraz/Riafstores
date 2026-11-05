import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/account";
import {
  getLoginChallenge,
  replaceLoginChallenge,
} from "@/lib/account-server";
import { readJsonBody, readString } from "@/lib/api-request";
import { sendLoginCode } from "@/lib/mailer";

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
      { error: "Your sign-in request has expired. Please start again." },
      { status: 400 },
    );
  }

  const existing = await getLoginChallenge(challengeId);
  if (!existing || existing.email !== email) {
    return NextResponse.json(
      { error: "Your sign-in request has expired. Please start again." },
      { status: 400 },
    );
  }

  const challenge = await replaceLoginChallenge(challengeId);
  if (!challenge) {
    return NextResponse.json(
      { error: "Your sign-in request has expired. Please start again." },
      { status: 400 },
    );
  }

  try {
    const delivery = await sendLoginCode(email, challenge.code);
    return NextResponse.json({
      ok: true,
      email,
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt,
      emailSent: delivery.delivered,
      devCode: delivery.devCode,
    });
  } catch (error) {
    console.error("Could not resend sign-in code", error);
    return NextResponse.json(
      {
        error:
          "We could not send a new code. Email delivery is not configured on this server.",
      },
      { status: 503 },
    );
  }
}

