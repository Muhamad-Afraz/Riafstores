import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { dbQuery, isDatabaseConfigured } from "./db";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export class MediaUploadError extends Error {}

function extensionFor(file: File) {
  const byMime = allowedTypes[file.type];
  if (byMime) return byMime;

  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowedExtensions = new Set(Object.values(allowedTypes));
  return allowedExtensions.has(fromName) ? fromName : null;
}

export async function saveProductImage(file: File) {
  const extension = extensionFor(file);

  if (!extension) {
    throw new MediaUploadError(
      "Use a JPG, PNG, WebP, AVIF or GIF image.",
    );
  }

  if (file.size <= 0) {
    throw new MediaUploadError("That image file is empty.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new MediaUploadError("Images must be 8 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (isDatabaseConfigured()) {
    const id = randomUUID();
    await dbQuery(
      "INSERT INTO catalog_media (id, mime_type, data) VALUES ($1, $2, $3)",
      [id, file.type || `image/${extension}`, buffer],
    );
    return { url: `/api/media/${id}` };
  }

  const directory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
  );
  await fs.mkdir(directory, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  await fs.writeFile(path.join(directory, filename), buffer);

  return { url: `/uploads/products/${filename}` };
}
