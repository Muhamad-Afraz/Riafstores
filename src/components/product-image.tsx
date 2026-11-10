import { getProductImages, type Product } from "@/lib/products";
import { ProductArt } from "./product-art";

type ProductImageProps = {
  product: Product;
  /** Index into the product's pictures; falls back to the illustrated art. */
  index?: number;
  alt?: string;
  className?: string;
  loading?: "eager" | "lazy";
};

/**
 * Renders an uploaded product picture when one exists, otherwise the original
 * illustrated artwork. Used everywhere a product is shown across the store.
 */
export function ProductImage({
  product,
  index = 0,
  alt,
  className = "",
  loading = "lazy",
}: ProductImageProps) {
  const images = getProductImages(product);
  const source =
    images.length > 0 ? images[Math.min(index, images.length - 1)] : undefined;

  if (source) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={source}
        alt={alt ?? product.name}
        loading={loading}
        className={`${className} object-cover`}
      />
    );
  }

  const tone =
    product.gallery[index] ??
    product.gallery[0] ??
    "cream";

  return (
    <ProductArt
      art={product.art}
      tone={tone}
      title={alt ?? product.name}
      className={className}
    />
  );
}
