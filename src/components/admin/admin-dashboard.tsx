"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Close,
  LogOut,
  Plus,
  Search,
  Trash,
} from "@/components/icons";
import { ProductArt } from "@/components/product-art";
import {
  categories,
  formatPrice,
  getCategoryName,
  type CategorySlug,
  type Product,
} from "@/lib/products";

type ProductForm = {
  name: string;
  category: CategorySlug;
  price: string;
  stock: string;
  tagline: string;
  description: string;
  badge: string;
};

type SortValue = "newest" | "name" | "price-asc" | "price-desc";

const emptyForm: ProductForm = {
  name: "",
  category: "electronics",
  price: "",
  stock: "10",
  tagline: "",
  description: "",
  badge: "",
};

const PAGE_SIZE = 10;

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-cream px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/40";
const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45";

export function AdminDashboard({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [pending, setPending] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CategorySlug>("all");
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const update = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    setPage(1);
  }, [query, category, sort]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const matched = products.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (!normalized) return true;

      return [
        product.name,
        product.slug,
        product.tagline,
        getCategoryName(product.category),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });

    return [...matched].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
  }, [products, query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = filtered.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const pageItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: Array<number | "ellipsis"> = [1];

    if (currentPage > 3) items.push("ellipsis");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let value = start; value <= end; value += 1) {
      items.push(value);
    }

    if (currentPage < totalPages - 2) items.push("ellipsis");

    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("newest");
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {
      // Clear the client view even if the request fails.
    }
    router.replace("/admin");
    router.refresh();
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as {
        error?: string;
        products?: Product[];
      };

      if (!response.ok || !data.products) {
        throw new Error(data.error ?? "Unable to add product.");
      }

      setProducts(data.products);
      setForm(emptyForm);
      setShowForm(false);
      setQuery("");
      setCategory("all");
      setSort("newest");
      setPage(1);
      setStatus({ type: "success", message: "Product added to the store." });
    } catch (caught) {
      setStatus({
        type: "error",
        message:
          caught instanceof Error ? caught.message : "Unable to add product.",
      });
    } finally {
      setPending(false);
    }
  };

  const handleRemove = async (product: Product) => {
    if (
      !window.confirm(
        `Remove "${product.name}" from the store? It will no longer be listed.`,
      )
    ) {
      return;
    }

    setRemovingId(product.id);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      const data = (await response.json()) as {
        error?: string;
        products?: Product[];
      };

      if (!response.ok || !data.products) {
        throw new Error(data.error ?? "Unable to remove product.");
      }

      setProducts(data.products);
      setStatus({ type: "success", message: "Product removed." });
    } catch (caught) {
      setStatus({
        type: "error",
        message:
          caught instanceof Error ? caught.message : "Unable to remove product.",
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
            RIAF Admin
          </p>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Product management
          </h1>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink/55">
            Search, filter and manage every product in the store.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white/50 px-4 text-[11px] font-semibold text-ink transition-colors hover:border-ink/25 disabled:opacity-60"
          >
            <LogOut className="h-3.5 w-3.5" />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
          <Link
            href="/shop"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white/50 px-4 text-[11px] font-semibold text-ink transition-colors hover:border-ink/25"
          >
            View store
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-olive px-4 text-[11px] font-semibold text-cream transition-colors hover:bg-ink"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Close form" : "Add product"}
          </button>
        </div>
      </div>

      {status && (
        <p
          role="status"
          className={`mt-6 rounded-xl border px-4 py-3 text-[12px] ${
            status.type === "error"
              ? "border-ink/15 bg-beige/70 text-ink/70"
              : "border-olive/30 bg-olive-soft text-ink/70"
          }`}
        >
          {status.message}
        </p>
      )}

      {showForm && (
        <section className="mt-8 rounded-[24px] border border-line bg-white/55 p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-cream">
              <Plus className="h-4 w-4" />
            </span>
            <h2 className="font-heading text-lg font-extrabold tracking-tight text-ink">
              Add product
            </h2>
          </div>

          <form onSubmit={handleAdd} className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="product-name" className={labelClass}>
                  Name
                </label>
                <input
                  id="product-name"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
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
                    update("category", event.target.value as CategorySlug)
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
                  onChange={(event) => update("badge", event.target.value)}
                  placeholder="New"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="product-price" className={labelClass}>
                  Price (USD)
                </label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => update("price", event.target.value)}
                  placeholder="49"
                  className={inputClass}
                  required
                />
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
                  onChange={(event) => update("stock", event.target.value)}
                  placeholder="10"
                  className={inputClass}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="product-tagline" className={labelClass}>
                  Tagline
                </label>
                <input
                  id="product-tagline"
                  value={form.tagline}
                  onChange={(event) => update("tagline", event.target.value)}
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
                    update("description", event.target.value)
                  }
                  placeholder="Describe the product for its detail page."
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-[13px] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/40"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex h-10 items-center rounded-full border border-line px-5 text-[11px] font-semibold text-ink/60 transition-colors hover:border-ink/25 hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Adding..." : "Add product"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-olive">
              Live catalogue
            </p>
            <h2 className="mt-1 font-heading text-xl font-extrabold tracking-tight text-ink">
              {products.length} {products.length === 1 ? "product" : "products"}
            </h2>
          </div>
          {filtered.length !== products.length && (
            <p className="text-[11px] text-ink/45">
              {filtered.length} matching
            </p>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-[24px] border border-line bg-white/45">
          <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, slugs or taglines"
                aria-label="Search products"
                className="h-10 w-full rounded-full border border-line bg-cream pl-10 pr-10 text-[12px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink/40 transition-colors hover:bg-beige hover:text-ink"
                >
                  <Close className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as "all" | CategorySlug)
              }
              aria-label="Filter by category"
              className="h-10 rounded-full border border-line bg-cream px-3.5 text-[12px] text-ink outline-none transition-colors focus:border-ink/40 sm:w-40"
            >
              <option value="all">All categories</option>
              {categories.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {entry.name}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortValue)}
              aria-label="Sort products"
              className="h-10 rounded-full border border-line bg-cream px-3.5 text-[12px] text-ink outline-none transition-colors focus:border-ink/40 sm:w-40"
            >
              <option value="newest">Newest first</option>
              <option value="name">Name A-Z</option>
              <option value="price-asc">Price low-high</option>
              <option value="price-desc">Price high-low</option>
            </select>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] text-ink/50">
                No products match your search.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-[11px] font-semibold text-olive transition-colors hover:text-ink"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {visibleProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap"
                >
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-beige">
                    <ProductArt
                      art={product.art}
                      tone={product.gallery[0]}
                      className="h-full w-full"
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-[13px] font-bold text-ink">
                        {product.name}
                      </p>
                      {product.badge && (
                        <span className="rounded-full bg-beige px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink/55">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-[11px] text-ink/45">
                      {getCategoryName(product.category)} ·{" "}
                      {formatPrice(product.price)} ·{" "}
                      {product.stock <= 0
                        ? "Out of stock"
                        : `${product.stock} in stock`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/product/${product.slug}`}
                      className="inline-flex h-9 items-center rounded-full border border-line px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/60 transition-colors hover:border-ink/30 hover:text-ink"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(product)}
                      disabled={removingId === product.id}
                      aria-label={`Remove ${product.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink/45 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-50"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-3">
              <p className="text-[11px] text-ink/45">
                Showing {startIndex + 1}-
                {Math.min(startIndex + PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink/55 transition-colors hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                  {pageItems.map((item, index) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-[11px] text-ink/35"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        aria-label={`Page ${item}`}
                        aria-current={item === currentPage ? "page" : undefined}
                        className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-[11px] font-semibold transition-colors ${
                          item === currentPage
                            ? "bg-ink text-cream"
                            : "border border-line text-ink/55 hover:border-ink/30 hover:text-ink"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>

                <p className="text-[11px] text-ink/45 sm:hidden">
                  Page {currentPage} of {totalPages}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink/55 transition-colors hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
