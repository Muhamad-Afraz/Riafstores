"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { findDiscountCode, type DiscountCode } from "@/lib/offers";
import {
  formatPrice,
  products as baseProducts,
  type ArtKey,
  type Product,
  type Tone,
} from "@/lib/products";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  art: ArtKey;
  tone: Tone;
  variant: string;
  quantity: number;
};

type Notice = {
  id: number;
  message: string;
};

type AddItemOptions = {
  variant?: string;
  tone?: Tone;
  quantity?: number;
};

type StoreContextValue = {
  items: CartItem[];
  availableItems: CartItem[];
  unavailableItems: CartItem[];
  count: number;
  availableCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCode: string | null;
  coupon: DiscountCode | null;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  wishlist: string[];
  wishlistProducts: Product[];
  recentIds: string[];
  recentProducts: Product[];
  catalog: Product[];
  catalogReady: boolean;
  notice: Notice | null;
  hydrated: boolean;
  addItem: (product: Product, options?: AddItemOptions) => void;
  removeItem: (key: string) => void;
  removeUnavailable: () => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  recordView: (productId: string) => void;
  notify: (message: string) => void;
  clearNotice: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "riaf-cart";
const WISHLIST_KEY = "riaf-wishlist";
const RECENT_KEY = "riaf-recent";
const COUPON_KEY = "riaf-coupon";
const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING = 6;

const tones: Tone[] = ["cream", "beige", "dark", "olive"];

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.key === "string" &&
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.art === "string" &&
    typeof item.tone === "string" &&
    tones.includes(item.tone as Tone) &&
    typeof item.variant === "string" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

function readStringArray(raw: string | null) {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<Product[]>(baseProducts);
  const [catalogReady, setCatalogReady] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(CART_KEY);
      if (rawCart) {
        const parsed: unknown = JSON.parse(rawCart);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(isCartItem));
        }
      }

      setWishlist(readStringArray(window.localStorage.getItem(WISHLIST_KEY)));
      setRecentIds(readStringArray(window.localStorage.getItem(RECENT_KEY)));

      const rawCoupon = window.localStorage.getItem(COUPON_KEY);
      if (rawCoupon && findDiscountCode(rawCoupon)) {
        setAppliedCode(rawCoupon.trim().toUpperCase());
      }
    } catch {
      // Ignore malformed or unavailable storage.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    let active = true;

    const loadCatalog = () => {
      fetch("/api/products", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as { products?: unknown };
        })
        .then((data) => {
          if (active && data && Array.isArray(data.products)) {
            setCatalog(data.products as Product[]);
            setCatalogReady(true);
          }
        })
        .catch(() => {
          // Keep the current catalogue if the request fails.
        });
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadCatalog();
    };

    loadCatalog();
    window.addEventListener("focus", loadCatalog);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      window.removeEventListener("focus", loadCatalog);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pathname]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Storage may be unavailable in private mode.
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // Storage may be unavailable in private mode.
    }
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds));
    } catch {
      // Storage may be unavailable in private mode.
    }
  }, [recentIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (appliedCode) {
        window.localStorage.setItem(COUPON_KEY, appliedCode);
      } else {
        window.localStorage.removeItem(COUPON_KEY);
      }
    } catch {
      // Storage may be unavailable in private mode.
    }
  }, [appliedCode, hydrated]);

  const notify = useCallback((message: string) => {
    setNotice({ id: Date.now(), message });
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  const applyCoupon = useCallback(
    (code: string) => {
      const coupon = findDiscountCode(code);

      if (!coupon) {
        return {
          ok: false,
          message: "That code is not recognised. Try RIAF10 or RIAF15.",
        };
      }

      setAppliedCode(coupon.code);

      const currentSubtotal = items.reduce((total, item) => {
        const available =
          !catalogReady ||
          catalog.some((product) => product.id === item.productId);
        return available ? total + item.price * item.quantity : total;
      }, 0);

      if (coupon.minSubtotal > 0 && currentSubtotal < coupon.minSubtotal) {
        return {
          ok: true,
          message: `Code saved. Add ${formatPrice(
            Math.ceil(coupon.minSubtotal - currentSubtotal)
          )} more to unlock ${coupon.percent}% off.`,
        };
      }

      return {
        ok: true,
        message: `${coupon.code} applied. You saved ${coupon.percent}%.`,
      };
    },
    [items, catalog, catalogReady]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCode(null);
    notify("Offer code removed");
  }, [notify]);

  const addItem = useCallback(
    (product: Product, options: AddItemOptions = {}) => {
      if (product.stock <= 0) {
        notify(`${product.name} is sold out`);
        return;
      }

      const variant = options.variant ?? product.variants[0];
      const tone = options.tone ?? product.gallery[0];
      const quantity = Math.max(1, options.quantity ?? 1);
      const key = `${product.id}::${variant}`;

      setItems((current) => {
        const existing = current.find((item) => item.key === key);
        if (existing) {
          return current.map((item) =>
            item.key === key
              ? {
                  ...item,
                  tone,
                  quantity: Math.min(
                    product.stock,
                    Math.min(99, item.quantity + quantity)
                  ),
                }
              : item
          );
        }

        return [
          ...current,
          {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            art: product.art,
            tone,
            variant,
            quantity: Math.min(product.stock, quantity),
          },
        ];
      });

      notify(`${product.name} added to cart`);
    },
    [notify]
  );

  const removeItem = useCallback(
    (key: string) => {
      setItems((current) => current.filter((item) => item.key !== key));
      notify("Removed from cart");
    },
    [notify]
  );

  const removeUnavailable = useCallback(() => {
    if (!catalogReady) return;

    setItems((current) => {
      const available = new Set(catalog.map((product) => product.id));
      return current.filter((item) => available.has(item.productId));
    });
    notify("Unavailable items removed");
  }, [catalog, catalogReady, notify]);

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      setItems((current) =>
        current
          .map((item) => {
            if (item.key !== key) return item;
            const product = catalog.find(
              (entry) => entry.id === item.productId
            );
            const max = Math.min(99, product ? product.stock : 99);
            return {
              ...item,
              quantity: Math.min(max, Math.max(0, Math.floor(quantity))),
            };
          })
          .filter((item) => item.quantity > 0)
      );
    },
    [catalog]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    notify("Cart cleared");
  }, [notify]);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (productId: string) => {
      const saved = wishlist.includes(productId);
      setWishlist((current) =>
        saved
          ? current.filter((id) => id !== productId)
          : [...current, productId]
      );
      notify(saved ? "Removed from wishlist" : "Saved to wishlist");
    },
    [notify, wishlist]
  );

  const recordView = useCallback((productId: string) => {
    setRecentIds((current) => [
      productId,
      ...current.filter((id) => id !== productId),
    ].slice(0, 8));
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const catalogIds = new Set(catalog.map((product) => product.id));
    const availableItems = catalogReady
      ? items.filter((item) => catalogIds.has(item.productId))
      : items;
    const unavailableItems = catalogReady
      ? items.filter((item) => !catalogIds.has(item.productId))
      : [];

    const count = items.reduce((total, item) => total + item.quantity, 0);
    const availableCount = availableItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const subtotal = availableItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : STANDARD_SHIPPING;

    const coupon = appliedCode ? findDiscountCode(appliedCode) : null;
    const discount =
      coupon && subtotal >= coupon.minSubtotal
        ? Math.round(subtotal * coupon.percent) / 100
        : 0;

    const wishlistProducts = wishlist
      .map((id) => catalog.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product));

    const recentProducts = recentIds
      .map((id) => catalog.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product));

    return {
      items,
      availableItems,
      unavailableItems,
      count,
      availableCount,
      subtotal,
      discount,
      shipping,
      total: Math.max(0, subtotal - discount) + shipping,
      appliedCode,
      coupon,
      applyCoupon,
      removeCoupon,
      wishlist,
      wishlistProducts,
      recentIds,
      recentProducts,
      catalog,
      catalogReady,
      notice,
      hydrated,
      addItem,
      removeItem,
      removeUnavailable,
      updateQuantity,
      clearCart,
      isWishlisted,
      toggleWishlist,
      recordView,
      notify,
      clearNotice,
    };
  }, [
    items,
    wishlist,
    recentIds,
    catalog,
    catalogReady,
    notice,
    hydrated,
    appliedCode,
    applyCoupon,
    removeCoupon,
    addItem,
    removeItem,
    removeUnavailable,
    updateQuantity,
    clearCart,
    isWishlisted,
    toggleWishlist,
    recordView,
    notify,
    clearNotice,
  ]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
