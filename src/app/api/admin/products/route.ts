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
  const slugs = new Set(catalog.map((product) => product.slug));
  let slug = baseSlug;
  let suffix = 2;

  while (slugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const tagline =
    readString(body.tagline) || "A new addition to the RIAF edit.";
  const description = readString(body.description) || tagline;
  const badge = readString(body.badge);

  const product: Product = {
    id: `custom-${slug}-${Date.now().toString(36)}`,
    slug,
    name,
    tagline,
    category,
    price: Math.round(price * 100) / 100,
    rating: 5,
    reviews: 0,
    badge: badge || undefined,
    art: categoryData.art,
    gallery: [categoryData.tone],
    description,
    details: [tagline],
    features: [
      "Free shipping over $75",
      "30-day returns and exchanges",
      "2-year warranty",
    ],
    variantLabel: "Style",
    variants: ["Standard"],
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
