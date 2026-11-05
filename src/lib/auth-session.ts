import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { findAccountById, type StoreAccount } from "./account-server";

export const ACCOUNT_COOKIE = "riaf-account-session";
export const ACCOUNT_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export const PASSWORD_RESET_COOKIE = "riaf-password-reset";
export const PASSWORD_RESET_MAX_AGE = 60 * 15;

type SessionPayload = {
  sub: string;
  exp: number;
};

type PasswordResetPayload = {
  sub: string;
  purpose: "password-reset";
  exp: number;
};

function sessionSecret() {
  return (
    process.env.AUTH_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    "riaf-development-account-session-secret"
  );
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAccountToken(accountId: string) {
  const payload: SessionPayload = {
    sub: accountId,
    exp: Math.floor(Date.now() / 1000) + ACCOUNT_SESSION_MAX_AGE,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAccountToken(
  token: string | undefined,
): SessionPayload | null {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (!safeEqual(signature, sign(encoded))) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    if (
      typeof payload.sub !== "string" ||
      !payload.sub ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return { sub: payload.sub, exp: payload.exp };
  } catch {
    return null;
  }
}

export function accountCookieOptions(remember: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: ACCOUNT_SESSION_MAX_AGE } : {}),
  };
}

export async function setAccountSession(accountId: string, remember: boolean) {
  const store = await cookies();
  store.set(ACCOUNT_COOKIE, createAccountToken(accountId), {
    ...accountCookieOptions(remember),
  });
}

export async function clearAccountSession() {
  const store = await cookies();
  store.delete(ACCOUNT_COOKIE);
}

export async function getSessionAccount(): Promise<StoreAccount | null> {
  const store = await cookies();
  const payload = verifyAccountToken(store.get(ACCOUNT_COOKIE)?.value);
  if (!payload) return null;

  return findAccountById(payload.sub);
}

export function createPasswordResetToken(accountId: string) {
  const payload: PasswordResetPayload = {
    sub: accountId,
    purpose: "password-reset",
    exp: Math.floor(Date.now() / 1000) + PASSWORD_RESET_MAX_AGE,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyPasswordResetToken(token: string | undefined) {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (!safeEqual(signature, sign(encoded))) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<PasswordResetPayload>;

    if (
      typeof payload.sub !== "string" ||
      !payload.sub ||
      payload.purpose !== "password-reset" ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
}

function passwordResetCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PASSWORD_RESET_MAX_AGE,
  };
}

export async function setPasswordResetSession(accountId: string) {
  const store = await cookies();
  store.set(
    PASSWORD_RESET_COOKIE,
    createPasswordResetToken(accountId),
    passwordResetCookieOptions(),
  );
}

export async function clearPasswordResetSession() {
  const store = await cookies();
  store.delete(PASSWORD_RESET_COOKIE);
}

export async function getPasswordResetAccountId() {
  const store = await cookies();
  return verifyPasswordResetToken(store.get(PASSWORD_RESET_COOKIE)?.value);
}
