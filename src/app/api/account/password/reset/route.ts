import { NextResponse } from "next/server";
import { isValidPassword } from "@/lib/account";
import { updateAccountPassword } from "@/lib/account-server";
import { readJsonBody, readString } from "@/lib/api-request";
import {
  clearAccountSession,
  clearPasswordResetSession,
  getPasswordResetAccountId,
} from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const accountId = await getPasswordResetAccountId();

  if (!accountId) {
    return NextResponse.json(
      {
        error:
          "Your password reset session has expired. Please request a new code.",
      },
      { status: 401 },
    );
  }

  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const password = readString(body.password);

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: "Use at least 8 characters for your password.", field: "password" },
      { status: 400 },
    );
  }

  const updated = await updateAccountPassword(accountId, password);
  if (!updated) {
    return NextResponse.json(
      { error: "This account could not be found. Please start again." },
      { status: 404 },
    );
  }

  await clearPasswordResetSession();
  await clearAccountSession();

  return NextResponse.json({ ok: true });
}
