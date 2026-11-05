import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getCatalogProducts();
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Failed to load catalog", error);
    return NextResponse.json(
      { error: "Unable to load products." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
