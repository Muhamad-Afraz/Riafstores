import { NextResponse } from "next/server";
import {
  clearAdminSession,
  isAdminConfigured,
  setAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

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

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminCredentials(email, password)) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  await setAdminSession(email.trim().toLowerCase());
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
