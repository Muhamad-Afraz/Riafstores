import { NextResponse } from "next/server";
import {
  adminEmailAddress,
  clearAdminSession,
  isAdminConfigured,
  isAdminOtpRequired,
  setAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import {
  createLoginChallenge,
  deleteChallengesForEmail,
} from "@/lib/account-server";
import { readJsonBody, readString } from "@/lib/api-request";
import { sendAdminLoginCode } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET.",
      },
      { status: 500 },
    );
  }

  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = readString(body.email);
  const password = readString(body.password);

  if (!verifyAdminCredentials(email, password)) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  if (!isAdminOtpRequired()) {
    await setAdminSession(adminEmailAddress());
    return NextResponse.json({ ok: true, otpRequired: false });
  }

  const adminEmail = adminEmailAddress();

  // Only one live admin challenge at a time.
  await deleteChallengesForEmail(adminEmail, "admin-login");

  const challenge = await createLoginChallenge(adminEmail, "admin-login");

  try {
    const delivery = await sendAdminLoginCode(adminEmail, challenge.code);

    return NextResponse.json({
      ok: true,
      otpRequired: true,
      email: adminEmail,
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt,
      emailSent: delivery.delivered,
      devCode: delivery.devCode,
    });
  } catch (error) {
    console.error("Could not send admin sign-in code", error);
    await deleteChallengesForEmail(adminEmail, "admin-login");

    return NextResponse.json(
      {
        error:
          "We could not send the verification code. Check the email delivery settings (RESEND_API_KEY or SMTP) and try again.",
      },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
