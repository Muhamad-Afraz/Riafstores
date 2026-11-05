import { NextResponse } from "next/server";
import { isValidEmail, isValidName, isValidPassword } from "@/lib/account";
import {
  AccountExistsError,
  createAccount,
  findAccountByEmail,
  toPublicAccount,
} from "@/lib/account-server";
import { readJsonBody, readString } from "@/lib/api-request";
import { setAccountSession } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = readString(body.name).trim();
  const email = readString(body.email).trim();
  const password = readString(body.password);

  if (!isValidName(name)) {
    return NextResponse.json(
      { error: "Enter your full name.", field: "name" },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address.", field: "email" },
      { status: 400 },
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: "Use at least 8 characters for your password.", field: "password" },
      { status: 400 },
    );
  }

  const existing = await findAccountByEmail(email);
  if (existing) {
    return NextResponse.json(
      {
        error:
          "An account with this email already exists. Sign in instead.",
        field: "email",
      },
      { status: 409 },
    );
  }

  try {
    const account = await createAccount({ name, email, password });
    await setAccountSession(account.id, true);
    return NextResponse.json({ ok: true, user: toPublicAccount(account) });
  } catch (error) {
    if (error instanceof AccountExistsError) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Sign in instead.",
          field: "email",
        },
        { status: 409 },
      );
    }

    console.error("Could not create account", error);
    return NextResponse.json(
      { error: "We could not create your account. Please try again." },
      { status: 500 },
    );
  }
}
