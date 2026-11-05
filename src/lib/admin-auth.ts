import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "riaf-admin-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  email: string;
  exp: number;
};

function adminEmail() {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function isAdminConfigured() {
  return Boolean(adminEmail() && adminPassword() && sessionSecret());
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function verifyAdminCredentials(email: string, password: string) {
  if (!isAdminConfigured()) return false;
  const emailMatches = safeEqual(email.trim().toLowerCase(), adminEmail());
  const passwordMatches = safeEqual(password, adminPassword());
  return emailMatches && passwordMatches;
}

export function createAdminToken(email: string) {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAdminToken(token: string | undefined): SessionPayload | null {
  if (!token || !sessionSecret()) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (!safeEqual(signature, sign(encoded))) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    if (
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }

    return { email: payload.email, exp: payload.exp };
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  return Boolean(verifyAdminToken(store.get(ADMIN_COOKIE)?.value));
}

export async function setAdminSession(email: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, createAdminToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
