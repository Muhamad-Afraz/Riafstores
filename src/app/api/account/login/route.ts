import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail } from "@/lib/account";
import {
  createLoginChallenge,
  findAccountByEmail,
  verifyAccountPassword,
} from "@/lib/account-server";
import { readBoolean, readJsonBody, readString } from "@/lib/api-request";
import { sendLoginCode } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INVALID_CREDENTIALS =
  "The email or password you entered is incorrect. Please try again.";

async function pause() {
  await new Promise((resolve) => setTimeout(resolve, 400));
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = normalizeEmail(readString(body.email));
  const password = readString(body.password);
  const remember = readBoolean(body.remember, true);

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address.", field: "email" },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      { error: "Enter your password.", field: "password" },
      { status: 400 },
    );
  }

  const account = await findAccountByEmail(email);

  if (!account || !account.passwordHash) {
    await pause();
    return NextResponse.json(
      { error: INVALID_CREDENTIALS },
      { status: 401 },
    );
  }

  const valid = await verifyAccountPassword(account, password);
  if (!valid) {
    await pause();
    return NextResponse.json(
      { error: INVALID_CREDENTIALS },
      { status: 401 },
    );
  }

  const challenge = await createLoginChallenge(account.email);

  try {
    const delivery = await sendLoginCode(account.email, challenge.code);
    return NextResponse.json({
      ok: true,
      otpRequired: true,
      email: account.email,
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt,
      remember,
      emailSent: delivery.delivered,
      devCode: delivery.devCode,
    });
  } catch (error) {
    console.error("Could not deliver sign-in code", error);
    return NextResponse.json(
      {
        error:
          "We could not send your sign-in code. Email delivery is not configured on this server.",
      },
      { status: 503 },
    );
  }
}
