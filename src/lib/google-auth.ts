export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
};

export const GOOGLE_STATE_COOKIE = "riaf-google-oauth-state";

export function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function googleClientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
}

function googleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
}

export function requestOrigin(request: Request, fallback: string) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0];
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0];

  if (forwardedHost) {
    return `${forwardedProto?.trim() || "https"}://${forwardedHost.trim()}`;
  }

  return url.origin || fallback;
}

export function googleRedirectUri(origin: string) {
  return (
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    `${origin}/api/account/google/callback`
  );
}

export function buildGoogleAuthUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: googleClientId(),
    redirect_uri: googleRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  origin: string,
): Promise<GoogleProfile> {
  const body = new URLSearchParams({
    code,
    client_id: googleClientId(),
    client_secret: googleClientSecret(),
    redirect_uri: googleRedirectUri(origin),
    grant_type: "authorization_code",
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text().catch(() => "");
    throw new Error(
      `Google token exchange failed (${tokenResponse.status})${
        detail ? `: ${detail.slice(0, 200)}` : ""
      }`,
    );
  }

  const tokens = (await tokenResponse.json()) as {
    access_token?: string;
  };

  if (!tokens.access_token) {
    throw new Error("Google did not return an access token.");
  }

  const profileResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    },
  );

  if (!profileResponse.ok) {
    throw new Error(
      `Google profile request failed (${profileResponse.status}).`,
    );
  }

  const profile = (await profileResponse.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean | string;
    name?: string;
    picture?: string;
  };

  if (!profile.sub || !profile.email) {
    throw new Error("Google did not return a usable profile.");
  }

  const emailVerified =
    profile.email_verified === true || profile.email_verified === "true";

  return {
    sub: profile.sub,
    email: profile.email,
    emailVerified,
    name: profile.name?.trim() || profile.email.split("@")[0] || "RIAF Customer",
    picture: profile.picture ?? null,
  };
}
