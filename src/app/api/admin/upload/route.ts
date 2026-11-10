import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { MediaUploadError, saveProductImage } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES = 10;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid image upload." },
      { status: 400 },
    );
  }

  const files = [...formData.getAll("files"), ...formData.getAll("file")].filter(
    (entry): entry is File => entry instanceof File,
  );

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Choose at least one image to upload." },
      { status: 400 },
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Upload up to ${MAX_FILES} images at a time.` },
      { status: 400 },
    );
  }

  try {
    const urls: string[] = [];

    for (const file of files) {
      const saved = await saveProductImage(file);
      urls.push(saved.url);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    if (error instanceof MediaUploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Failed to upload product image", error);
    return NextResponse.json(
      { error: "Unable to upload the image. Please try again." },
      { status: 500 },
    );
  }
}
