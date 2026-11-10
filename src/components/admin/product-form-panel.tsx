"use client";

import type { FormEvent } from "react";
import { Pencil, Plus } from "@/components/icons";
import {
  categories,
  type CategorySlug,
  type Product,
} from "@/lib/products";
import { ProductImages } from "./product-images";

export type ProductForm = {
  name: string;
  slug: string;
  category: CategorySlug;
  price: string;
  compareAt: string;
  stock: string;
  badge: string;
  tagline: string;
  description: string;
  details: string;
  features: string;
  variantLabel: string;
  variants: string;
  image: string;
  images: string[];
};

export const emptyForm: ProductForm = {
  name: "",
  slug: "",
  category: "electronics",
  price: "",
  compareAt: "",
  stock: "10",
  badge: "",
  tagline: "",
  description: "",
  details: "",
  features: "",
  variantLabel: "Style",
  variants: "Standard",
  image: "",
  images: [],
};

export function productToForm(product: Product): ProductForm {
  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: String(product.price),
    compareAt: product.compareAt ? String(product.compareAt) : "",
    stock: String(product.stock),
    badge: product.badge ?? "",
    tagline: product.tagline,
    description: product.description,
    details: product.details.join("\n"),
    features: product.features.join("\n"),
    variantLabel: product.variantLabel,
    variants: product.variants.join(", "),
    image: product.image ?? "",
    images: product.images ?? [],
  };
}

export function formToPayload(form: ProductForm) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    category: form.category,
    price: form.price,
    compareAt: form.compareAt,
    stock: form.stock,
    badge: form.badge.trim(),
    tagline: form.tagline.trim(),
    description: form.description.trim(),
    details: form.details,
    features: form.features,
    variantLabel: form.variantLabel.trim(),
    variants: form.variants,
    image: form.image.trim(),
    images: form.images,
  };
}

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-cream px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/40";
const textareaClass =
  "mt-2 w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-[13px] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/40";
const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45";
const helperClass = "mt-1 text-[10px] text-ink/35";

type ProductFormPanelProps = {
  form: ProductForm;
  editingName?: string;
  pending: boolean;
  onChange: <K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function ProductFormPanel({
  form,
  editingName,
  pending,
  onChange,
  onSubmit,
  onCancel,
}: ProductFormPanelProps) {
  const isEditing = Boolean(editingName);

  return (
    <section className="mt-8 rounded-[24px] border border-line bg-white/55 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-cream">
            {isEditing ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </span>
          <div>
            <h2 className="font-heading text-lg font-extrabold tracking-tight text-ink">
              {isEditing ? "Edit product" : "Add product"}
            </h2>
            {isEditing && (
              <p className="mt-0.5 text-[11px] text-ink/45">{editingName}</p>
            )}
          </div>
        </div>
        <p className="max-w-sm text-[11px] leading-relaxed text-ink/40">
          {isEditing
            ? "Update the details or swap the pictures. Changes go live immediately."
            : "Add the product details and upload its pictures. Everything can be edited later."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-5">
        <ProductImages
          image={form.image}
          images={form.images}
          disabled={pending}
          onChange={(next) => {
            onChange("image", next.image);
            onChange("images", next.images);
          }}
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="product-name" className={labelClass}>
              Name
            </label>
            <input
              id="product-name"
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Riaf Everyday Bottle"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="product-category" className={labelClass}>
              Category
            </label>
            <select
              id="product-category"
              value={form.category}
              onChange={(event) =>
                onChange("category", event.target.value as CategorySlug)
              }
              className={inputClass}
            >
              {categories.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-badge" className={labelClass}>
              Badge (optional)
            </label>
            <input
              id="product-badge"
              value={form.badge}
              onChange={(event) => onChange("badge", event.target.value)}
              placeholder="New"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="product-price" className={labelClass}>
              Price (SAR)
            </label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => onChange("price", event.target.value)}
              placeholder="49"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="product-compare-at" className={labelClass}>
              Compare-at price (optional)
            </label>
            <input
              id="product-compare-at"
              type="number"
              min="0"
              step="0.01"
              value={form.compareAt}
              onChange={(event) => onChange("compareAt", event.target.value)}
              placeholder="69"
              className={inputClass}
            />
            <p className={helperClass}>
              Shown crossed out to display a saving.
            </p>
          </div>

          <div>
            <label htmlFor="product-stock" className={labelClass}>
              Stock
            </label>
            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) => onChange("stock", event.target.value)}
              placeholder="10"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="product-variant-label" className={labelClass}>
              Variant label
            </label>
            <input
              id="product-variant-label"
              value={form.variantLabel}
              onChange={(event) =>
                onChange("variantLabel", event.target.value)
              }
              placeholder="Colour"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-variants" className={labelClass}>
              Variant options
            </label>
            <input
              id="product-variants"
              value={form.variants}
              onChange={(event) => onChange("variants", event.target.value)}
              placeholder="Oat, Moss, Ink"
              className={inputClass}
            />
            <p className={helperClass}>
              Separate options with commas. Leave blank for a single Standard
              option.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-slug" className={labelClass}>
              URL slug (optional)
            </label>
            <input
              id="product-slug"
              value={form.slug}
              onChange={(event) => onChange("slug", event.target.value)}
              placeholder="generated-from-the-name"
              className={inputClass}
            />
            <p className={helperClass}>
              Keep the existing slug to preserve links to this product.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-tagline" className={labelClass}>
              Tagline
            </label>
            <input
              id="product-tagline"
              value={form.tagline}
              onChange={(event) => onChange("tagline", event.target.value)}
              placeholder="A quiet everyday essential."
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="product-description"
              value={form.description}
              onChange={(event) =>
                onChange("description", event.target.value)
              }
              placeholder="Describe the product for its detail page."
              rows={4}
              className={textareaClass}
            />
          </div>

          <div>
            <label htmlFor="product-details" className={labelClass}>
              Details &amp; materials
            </label>
            <textarea
              id="product-details"
              value={form.details}
              onChange={(event) => onChange("details", event.target.value)}
              placeholder={"Adaptive ANC up to 42 dB\n36 hours of playtime"}
              rows={4}
              className={textareaClass}
            />
            <p className={helperClass}>One item per line.</p>
          </div>

          <div>
            <label htmlFor="product-features" className={labelClass}>
              In the box &amp; care
            </label>
            <textarea
              id="product-features"
              value={form.features}
              onChange={(event) => onChange("features", event.target.value)}
              placeholder={"Four silicone tip sizes\nTwo-year warranty"}
              rows={4}
              className={textareaClass}
            />
            <p className={helperClass}>One item per line.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[11px] font-semibold text-ink/60 transition-colors hover:border-ink/25 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Add product"}
          </button>
        </div>
      </form>
    </section>
  );
}
