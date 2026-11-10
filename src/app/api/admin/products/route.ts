import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  addCatalogProduct,
  getCatalogProducts,
  removeCatalogProduct,
} from "@/lib/catalog";
import { categories, type CategorySlug, type Product } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value);
}

function readStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function readImage(value: unknown) {
  const source = readString(value);
  if (!source) return "";
  return /^(https?:\/\/|\/|data:image\/)/i.test(source) ? source : "";
}

function readImageList(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(value.map((entry) => readImage(entry)).filter(Boolean)),
  ).slice(0, 12);
}

function readOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = readNumber(value);
  return Number.isFinite(number) && number > 0
    ? Math.round(number * 100) / 100
    : undefined;
}

function uniqueSlug(base: string, used: Set<string>) {
  const safeBase = base || "new-product";
  let slug = safeBase;
  let suffix = 2;

  while (used.has(slug)) {
    slug = `${safeBase}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  return NextResponse.json({ products: await getCatalogProducts() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = readString(body.name);
  const category = readString(body.category) as CategorySlug;
  const price = readNumber(body.price);
  const stock = readNumber(body.stock);

  if (!name) {
    return NextResponse.json(
      { error: "Product name is required." },
      { status: 400 },
    );
  }

  const categoryData = categories.find((entry) => entry.slug === category);
  if (!categoryData) {
    return NextResponse.json(
      { error: "Choose a valid category." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "Enter a valid price." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return NextResponse.json(
      { error: "Enter a valid stock quantity." },
      { status: 400 },
    );
  }

  const catalog = await getCatalogProducts();
  const baseSlug = slugify(readString(body.slug) || name) || "new-product";
  const slug = uniqueSlug(
    baseSlug,
    new Set(catalog.map((product) => product.slug)),
  );

  const tagline =
    readString(body.tagline) || "A new addition to the RIAF edit.";
  const description = readString(body.description) || tagline;
  const badge = readString(body.badge);
  const image = readImage(body.image);
  const images = readImageList(body.images).filter((entry) => entry !== image);
  const compareAt = readOptionalNumber(body.compareAt);
  const details = readStringArray(body.details);
  const features = readStringArray(body.features);
  const variants = readStringArray(body.variants);

  const product: Product = {
    id: `custom-${slug}-${Date.now().toString(36)}`,
    slug,
    name,
    tagline,
    category,
    price: Math.round(price * 100) / 100,
    compareAt,
    rating: 5,
    reviews: 0,
    badge: badge || undefined,
    art: categoryData.art,
    gallery: [categoryData.tone],
    image: image || undefined,
    images: images.length > 0 ? images : undefined,
    description,
    details: details.length > 0 ? details : [tagline],
    features:
      features.length > 0
        ? features
        : [
            "Free shipping over SAR 75",
            "30-day returns and exchanges",
            "2-year warranty",
          ],
    variantLabel: readString(body.variantLabel) || "Style",
    variants: variants.length > 0 ? variants : ["Standard"],
    stock: Math.floor(stock),
    createdAt: new Date().toISOString(),
    popularity: 0,
  };

  try {
    await addCatalogProduct(product);
  } catch (error) {
    console.error("Failed to add product", error);
    const code = (error as { code?: string }).code;
    return NextResponse.json(
      {
        error:
          code === "23505"
            ? "A product with that slug already exists."
            : "Unable to save the product. Please try again.",
      },
      { status: code === "23505" ? 409 : 500 },
    );
  }

  return NextResponse.json({
    product,
    products: await getCatalogProducts(),
  });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = readString(body.id);
  const catalog = await getCatalogProducts();
  const existing = catalog.find((product) => product.id === id);

  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const name = readString(body.name) || existing.name;
  const category = (readString(body.category) || existing.category) as CategorySlug;
  const categoryData = categories.find((entry) => entry.slug === category);

  if (!categoryData) {
    return NextResponse.json(
      { error: "Choose a valid category." },
      { status: 400 },
    );
  }

  const price =
    body.price === undefined ? existing.price : readNumber(body.price);
  const stock =
    body.stock === undefined ? existing.stock : readNumber(body.stock);

  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "Enter a valid price." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return NextResponse.json(
      { error: "Enter a valid stock quantity." },
      { status: 400 },
    );
  }

  const baseSlug =
    slugify(readString(body.slug) || name) || existing.slug || "product";
  const slug = uniqueSlug(
    baseSlug,
    new Set(
      catalog
        .filter((product) => product.id !== existing.id)
        .map((product) => product.slug),
    ),
  );

  const tagline =
    body.tagline === undefined
      ? existing.tagline
      : readString(body.tagline) || existing.tagline;
  const description =
    body.description === undefined
      ? existing.description
      : readString(body.description) || tagline;
  const badge =
    body.badge === undefined ? existing.badge : readString(body.badge) || undefined;

  const image =
    body.image === undefined ? existing.image ?? "" : readImage(body.image);
  const requestedImages =
    body.images === undefined
      ? existing.images ?? []
      : readImageList(body.images);
  const images = requestedImages.filter((entry) => entry !== image);

  const compareAt =
    body.compareAt === undefined
      ? existing.compareAt
      : readOptionalNumber(body.compareAt);

  const details =
    body.details === undefined
      ? existing.details
      : readStringArray(body.details);
  const features =
    body.features === undefined
      ? existing.features
      : readStringArray(body.features);

  const requestedVariants =
    body.variants === undefined
      ? existing.variants
      : readStringArray(body.variants);
  const variants =
    requestedVariants.length > 0 ? requestedVariants : ["Standard"];
  const variantLabel =
    body.variantLabel === undefined
      ? existing.variantLabel
      : readString(body.variantLabel) || existing.variantLabel;

  const product: Product = {
    ...existing,
    name,
    slug,
    tagline,
    category,
    price: Math.round(price * 100) / 100,
    compareAt,
    badge,
    art: category === existing.category ? existing.art : categoryData.art,
    gallery:
      existing.gallery.length > 0 ? existing.gallery : [categoryData.tone],
    image: image || undefined,
    images: images.length > 0 ? images : undefined,
    description,
    details,
    features,
    variantLabel,
    variants,
    stock: Math.floor(stock),
  };

  try {
    await addCatalogProduct(product);
  } catch (error) {
    console.error("Failed to update product", error);
    const code = (error as { code?: string }).code;
    return NextResponse.json(
      {
        error:
          code === "23505"
            ? "Another product already uses that slug."
            : "Unable to save the product. Please try again.",
      },
      { status: code === "23505" ? 409 : 500 },
    );
  }

  return NextResponse.json({
    product,
    products: await getCatalogProducts(),
  });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = readString(body.id);
  const catalog = await getCatalogProducts();

  if (!catalog.some((product) => product.id === id)) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (catalog.length <= 1) {
    return NextResponse.json(
      { error: "Keep at least one product in the store." },
      { status: 400 },
    );
  }

  try {
    await removeCatalogProduct(id);
  } catch (error) {
    console.error("Failed to remove product", error);
    return NextResponse.json(
      { error: "Unable to remove the product. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ products: await getCatalogProducts() });
}
