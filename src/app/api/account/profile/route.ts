import { NextResponse } from "next/server";
import { isValidEmail, isValidName } from "@/lib/account";
import {
  AccountExistsError,
  findAccountByEmail,
  toPublicAccount,
  updateAccount,
} from "@/lib/account-server";
import { readJsonBody, readString } from "@/lib/api-request";
import { getSessionAccount } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = await getSessionAccount();
  if (!session) {
    return NextResponse.json(
      { error: "Your session has ended. Please sign in again." },
      { status: 401 },
    );
  }

  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = readString(body.name).trim();
  const email = readString(body.email).trim();

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

  const duplicate = await findAccountByEmail(email);
  if (duplicate && duplicate.id !== session.id) {
    return NextResponse.json(
      {
        error:
          "Another account already uses this email address. Choose a different email.",
        field: "email",
      },
      { status: 409 },
    );
  }

  try {
    const updated = await updateAccount(session.id, { name, email });
    if (!updated) {
      return NextResponse.json(
        { error: "This account could not be found. Please sign in again." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, user: toPublicAccount(updated) });
  } catch (error) {
    if (error instanceof AccountExistsError) {
      return NextResponse.json(
        {
          error:
            "Another account already uses this email address. Choose a different email.",
          field: "email",
        },
        { status: 409 },
      );
    }

    console.error("Could not update account", error);
    return NextResponse.json(
      { error: "We could not update your profile. Please try again." },
      { status: 500 },
    );
  }
}
