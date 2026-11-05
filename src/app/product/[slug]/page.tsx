import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { RecentlyViewed } from "@/components/recently-viewed";
import {
  getCatalogProductBySlug,
  getCatalogProducts,
  getRelatedCatalogProducts,
} from "@/lib/catalog";
import { getCategoryName } from "@/lib/products";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} — RIAF`,
      description: product.tagline,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const catalog = await getCatalogProducts();
  const product = catalog.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const related = getRelatedCatalogProducts(catalog, product);

  return (
    <>
      <div className="sr-only">
        {product.name} — {getCategoryName(product.category)}
      </div>
      <ProductDetail product={product} related={related} />
      <RecentlyViewed excludeId={product.id} />
    </>
  );
}
