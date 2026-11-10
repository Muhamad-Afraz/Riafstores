import { NextResponse } from "next/server";
import { dbQuery, isDatabaseConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { id } = await params;

  try {
    const rows = await dbQuery<{ mime_type: string; data: Buffer }>(
      "SELECT mime_type, data FROM catalog_media WHERE id = $1",
      [id],
    );
    const media = rows[0];

    if (!media) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(media.data), {
      headers: {
        "Content-Type": media.mime_type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to load product image", error);
    return new NextResponse("Not found", { status: 404 });
  }
}
