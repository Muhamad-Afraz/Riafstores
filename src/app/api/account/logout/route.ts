import { NextResponse } from "next/server";
import { clearAccountSession } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearAccountSession();
  return NextResponse.json({ ok: true });
}
