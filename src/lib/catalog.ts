import { promises as fs } from "node:fs";
import path from "node:path";
import { dbQuery, isDatabaseConfigured } from "./db";
import {
  categories,
  products as baseProducts,
  type ArtKey,
  type Product,
  type Tone,
} from "./products";

type CatalogFile = {
  added: Product[];
  removed: string[];
};

const catalogPath = path.join(process.cwd(), "data", "catalog.json");
const artKeys: ArtKey[] = [
  "earbuds",
  "speaker",
  "watch",
  "hoodie",
  "tee",
  "cap",
  "socks",
  "case",
  "bag",
  "sunglasses",
  "cable",
  "lamp",
  "mug",
  "candle",
  "throw",
];
const tones: Tone[] = ["cream", "beige", "dark", "olive"];

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  const product = value as Partial<Product>;
  return (
    typeof product.id === "string" &&
    typeof product.slug === "string" &&
    typeof product.name === "string" &&
    typeof product.category === "string" &&
    categories.some((category) => category.slug === product.category) &&
    typeof product.price === "number" &&
    typeof product.art === "string" &&
    artKeys.includes(product.art as ArtKey) &&
    Array.isArray(product.gallery) &&
    product.gallery.every((tone) => tones.includes(tone)) &&
    Array.isArray(product.variants) &&
    product.variants.every((variant) => typeof variant === "string") &&
    typeof product.stock === "number"
  );
}

async function readFileCatalog(): Promise<CatalogFile> {
  try {
    const raw = await fs.readFile(catalogPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return { added: [], removed: [] };
    }
    const value = parsed as Partial<CatalogFile>;
    return {
      added: Array.isArray(value.added) ? value.added.filter(isProduct) : [],
      removed: Array.isArray(value.removed)
        ? value.removed.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return { added: [], removed: [] };
  }
}

async function writeFileCatalog(catalog: CatalogFile) {
  await fs.mkdir(path.dirname(catalogPath), { recursive: true });
  await fs.writeFile(
    catalogPath,
    `${JSON.stringify(catalog, null, 2)}\n`,
    "utf8",
  );
}

async function readDatabaseCatalog(): Promise<CatalogFile> {
  const rows = await dbQuery<{
    id: string;
    data: unknown;
    removed: boolean;
  }>("SELECT id, data, removed FROM catalog_entries");

  const added: Product[] = [];
  const removed: string[] = [];

  for (const row of rows) {
    if (row.removed) {
      removed.push(row.id);
    } else if (isProduct(row.data)) {
      added.push(row.data);
    }
  }

  return { added, removed };
}

async function readCatalog(): Promise<CatalogFile> {
  if (isDatabaseConfigured()) {
    return readDatabaseCatalog();
  }
  return readFileCatalog();
}

async function addDatabaseProduct(product: Product) {
  await dbQuery(
    `INSERT INTO catalog_entries (id, slug, data, removed, updated_at)
     VALUES ($1, $2, $3::jsonb, FALSE, NOW())
     ON CONFLICT (id) DO UPDATE
       SET slug = EXCLUDED.slug,
           data = EXCLUDED.data,
           removed = FALSE,
           updated_at = NOW()`,
    [product.id, product.slug, JSON.stringify(product)],
  );
}

async function removeDatabaseProduct(id: string) {
  const rows = await dbQuery<{ data: unknown }>(
    "SELECT data FROM catalog_entries WHERE id = $1",
    [id],
  );
  const existing = rows[0];
  const isCustom = Boolean(existing && isProduct(existing.data));

  if (isCustom) {
    await dbQuery("DELETE FROM catalog_entries WHERE id = $1", [id]);
    return;
  }

  await dbQuery(
    `INSERT INTO catalog_entries (id, slug, data, removed, updated_at)
     VALUES ($1, NULL, NULL, TRUE, NOW())
     ON CONFLICT (id) DO UPDATE
       SET slug = NULL,
           data = NULL,
           removed = TRUE,
           updated_at = NOW()`,
    [id],
  );
}

export async function getCatalogProducts() {
  const catalog = await readCatalog();
  const removed = new Set(catalog.removed);
  return [
    ...baseProducts.filter((product) => !removed.has(product.id)),
    ...catalog.added.filter((product) => !removed.has(product.id)),
  ];
}

export async function getCatalogProductBySlug(slug: string) {
  const catalog = await getCatalogProducts();
  return catalog.find((product) => product.slug === slug);
}

export async function getCatalogProductById(id: string) {
  const catalog = await getCatalogProducts();
  return catalog.find((product) => product.id === id);
}

export async function addCatalogProduct(product: Product) {
  if (isDatabaseConfigured()) {
    await addDatabaseProduct(product);
    return;
  }

  const catalog = await readFileCatalog();
  catalog.added = [
    ...catalog.added.filter((entry) => entry.id !== product.id),
    product,
  ];
  catalog.removed = catalog.removed.filter((id) => id !== product.id);
  await writeFileCatalog(catalog);
}

export async function removeCatalogProduct(id: string) {
  if (isDatabaseConfigured()) {
    await removeDatabaseProduct(id);
    return;
  }

  const catalog = await readFileCatalog();
  const isCustom = catalog.added.some((product) => product.id === id);
  catalog.added = catalog.added.filter((product) => product.id !== id);
  if (!isCustom) {
    catalog.removed = Array.from(new Set([...catalog.removed, id]));
  }
  await writeFileCatalog(catalog);
}

export function getRelatedCatalogProducts(
  catalog: Product[],
  product: Product,
  limit = 4,
) {
  const sameCategory = catalog.filter(
    (item) => item.category === product.category && item.id !== product.id,
  );
  const others = catalog.filter(
    (item) => item.category !== product.category && item.id !== product.id,
  );

  return [...sameCategory, ...others]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}
