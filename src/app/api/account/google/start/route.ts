import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  GOOGLE_STATE_COOKIE,
  buildGoogleAuthUrl,
  isGoogleConfigured,
  requestOrigin,
} from "@/lib/google-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request, request.nextUrl.origin);

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(
      new URL("/account/sign-in?error=google_not_configured", origin),
    );
  }

  const state = randomBytes(24).toString("base64url");
  const response = NextResponse.redirect(buildGoogleAuthUrl(origin, state));

  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
