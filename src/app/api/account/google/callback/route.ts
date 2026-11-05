import { NextResponse, type NextRequest } from "next/server";
import {
  AccountExistsError,
  createAccount,
  findAccountByEmail,
  findAccountByGoogleId,
  updateAccount,
} from "@/lib/account-server";
import {
  ACCOUNT_COOKIE,
  accountCookieOptions,
  createAccountToken,
} from "@/lib/auth-session";
import {
  GOOGLE_STATE_COOKIE,
  exchangeGoogleCode,
  isGoogleConfigured,
  requestOrigin,
} from "@/lib/google-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withClearedState(response: NextResponse) {
  response.cookies.set(GOOGLE_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

function fail(origin: string, reason: string) {
  return withClearedState(
    NextResponse.redirect(new URL(`/account/sign-in?error=${reason}`, origin)),
  );
}

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request, request.nextUrl.origin);

  if (!isGoogleConfigured()) {
    return fail(origin, "google_not_configured");
  }

  const params = request.nextUrl.searchParams;
  const oauthError = params.get("error");
  const code = params.get("code");
  const state = params.get("state");
  const expectedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;

  if (oauthError) {
    return fail(
      origin,
      oauthError === "access_denied" ? "google_cancelled" : "google_failed",
    );
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail(origin, "google_failed");
  }

  try {
    const profile = await exchangeGoogleCode(code, origin);

    if (!profile.emailVerified) {
      return fail(origin, "google_email_unverified");
    }

    let account = await findAccountByGoogleId(profile.sub);

    if (!account) {
      const existing = await findAccountByEmail(profile.email);

      if (existing) {
        account = await updateAccount(existing.id, {
          name: existing.name,
          email: existing.email,
          googleId: profile.sub,
          avatarUrl: existing.avatarUrl ?? profile.picture,
        });
      } else {
        account = await createAccount({
          name: profile.name,
          email: profile.email,
          googleId: profile.sub,
          avatarUrl: profile.picture,
        });
      }
    }

    if (!account) {
      return fail(origin, "google_failed");
    }

    const response = withClearedState(
      NextResponse.redirect(new URL("/account", origin)),
    );
    response.cookies.set(
      ACCOUNT_COOKIE,
      createAccountToken(account.id),
      accountCookieOptions(true),
    );

    return response;
  } catch (error) {
    if (error instanceof AccountExistsError) {
      return fail(origin, "google_account_conflict");
    }

    console.error("Google sign-in failed", error);
    return fail(origin, "google_failed");
  }
}
