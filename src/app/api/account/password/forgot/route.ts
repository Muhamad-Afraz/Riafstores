import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail } from "@/lib/account";
import {
  createLoginChallenge,
  deleteChallengesForEmail,
  findAccountByEmail,
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

  const email = normalizeEmail(readString(body.email));

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address.", field: "email" },
      { status: 400 },
    );
  }

  const account = await findAccountByEmail(email);
  if (!account) {
    return NextResponse.json(
      {
        error:
          "We could not find an account with that email address. Create an account instead.",
        field: "email",
      },
      { status: 404 },
    );
  }

  await deleteChallengesForEmail(email, "password-reset");

  const challenge = await createLoginChallenge(email, "password-reset");

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
    console.error("Could not deliver password reset code", error);
    return NextResponse.json(
      {
        error:
          "We could not send the reset code. Email delivery is not configured on this server.",
      },
      { status: 503 },
    );
  }
}
