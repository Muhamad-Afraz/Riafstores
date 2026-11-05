export type CategorySlug = "electronics" | "fashion" | "accessories" | "home";

export type ArtKey =
  | "earbuds"
  | "speaker"
  | "watch"
  | "hoodie"
  | "tee"
  | "cap"
  | "socks"
  | "case"
  | "bag"
  | "sunglasses"
  | "cable"
  | "lamp"
  | "mug"
  | "candle"
  | "throw";

export type Tone = "cream" | "beige" | "dark" | "olive";

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  art: ArtKey;
  tone: Tone;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: CategorySlug;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  badge?: string;
  art: ArtKey;
  gallery: Tone[];
  description: string;
  details: string[];
  features: string[];
  variantLabel: string;
  variants: string[];
  stock: number;
  createdAt: string;
  popularity: number;
};

export const categories: Category[] = [
  {
    slug: "electronics",
    name: "Electronics",
    description: "Audio and everyday tech, tuned for quiet.",
    art: "earbuds",
    tone: "dark",
  },
  {
    slug: "fashion",
    name: "Fashion",
    description: "Soft structure in a calm, neutral palette.",
    art: "hoodie",
    tone: "beige",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Finishing pieces that earn their keep.",
    art: "bag",
    tone: "olive",
  },
  {
    slug: "home",
    name: "Home",
    description: "Quiet objects that slow the room down.",
    art: "lamp",
    tone: "cream",
  },
];

export const products: Product[] = [
  {
    id: "buds-pro",
    slug: "riaf-buds-pro",
    name: "Riaf Buds Pro",
    tagline: "Adaptive noise cancelling. All-day quiet.",
    category: "electronics",
    price: 89,
    compareAt: 119,
    rating: 4.9,
    reviews: 2314,
    badge: "Best seller",
    art: "earbuds",
    gallery: ["dark", "beige", "olive"],
    description:
      "Our flagship wireless earbuds, tuned for long days and low noise. Adaptive ANC reads the room 50,000 times a second, while warm, spacious drivers keep music feeling human.",
    details: [
      "Adaptive ANC up to 42 dB",
      "36 hours total playtime with case",
      "IPX5 sweat and splash resistance",
      "USB-C and Qi wireless charging",
    ],
    features: [
      "Six beamforming microphones",
      "Spatial audio with head tracking",
      "Four silicone tip sizes included",
      "Two-year RIAF warranty",
    ],
    variantLabel: "Finish",
    variants: ["Obsidian", "Limestone", "Olive"],
    stock: 24,
    createdAt: "2026-01-18",
    popularity: 98,
  },
  {
    id: "buds-lite",
    slug: "riaf-buds-lite",
    name: "Riaf Buds Lite",
    tagline: "Everyday sound, lighter than air.",
    category: "electronics",
    price: 49,
    compareAt: 69,
    rating: 4.7,
    reviews: 1128,
    badge: "New",
    art: "earbuds",
    gallery: ["cream", "beige", "dark"],
    description:
      "The essentials, distilled. Buds Lite keeps the comfortable fit and clear calls of our flagship in a lighter, simpler package built for commutes and calls.",
    details: [
      "24 hours total playtime with case",
      "Dual-mic call clarity",
      "IPX4 water resistance",
      "USB-C fast charge",
    ],
    features: [
      "Instant pairing",
      "Touch controls",
      "Three tip sizes included",
      "Two-year RIAF warranty",
    ],
    variantLabel: "Finish",
    variants: ["Chalk", "Sand", "Charcoal"],
    stock: 38,
    createdAt: "2026-02-02",
    popularity: 86,
  },
  {
    id: "studio-anc",
    slug: "riaf-studio-anc",
    name: "Riaf Studio ANC",
    tagline: "Studio detail with a deeper hush.",
    category: "electronics",
    price: 129,
    rating: 4.8,
    reviews: 864,
    badge: "Pro pick",
    art: "earbuds",
    gallery: ["dark", "olive", "beige"],
    description:
      "For focused work and long flights. Studio ANC pairs high-resolution drivers with our quietest noise cancelling and a case that charges wirelessly.",
    details: [
      "42 dB adaptive noise cancelling",
      "Hi-Res certified drivers",
      "40 hours total playtime",
      "Multipoint Bluetooth connection",
    ],
    features: [
      "Custom EQ in the app",
      "Low-latency listening mode",
      "Wireless charging case",
      "Two-year RIAF warranty",
    ],
    variantLabel: "Finish",
    variants: ["Graphite", "Bone", "Olive"],
    stock: 12,
    createdAt: "2025-10-08",
    popularity: 91,
  },
  {
    id: "mini-speaker",
    slug: "riaf-mini-speaker",
    name: "Riaf Mini Speaker",
    tagline: "A small room, filled well.",
    category: "electronics",
    price: 69,
    compareAt: 79,
    rating: 4.6,
    reviews: 412,
    art: "speaker",
    gallery: ["olive", "cream", "dark"],
    description:
      "A palm-sized speaker with surprising warmth. Wrapped in recycled fabric with a machined dial, it is made to live on a shelf and travel easily.",
    details: [
      "12-hour battery",
      "360-degree sound",
      "IPX6 splash resistance",
      "USB-C charging",
    ],
    features: [
      "Bluetooth 5.3",
      "Stereo pairing",
      "Recycled fabric wrap",
      "Two-year RIAF warranty",
    ],
    variantLabel: "Colour",
    variants: ["Olive", "Chalk"],
    stock: 9,
    createdAt: "2025-12-12",
    popularity: 74,
  },
  {
    id: "buds-case",
    slug: "riaf-buds-case",
    name: "Riaf Buds Case",
    tagline: "A softer home for your buds.",
    category: "accessories",
    price: 29,
    rating: 4.8,
    reviews: 438,
    badge: "Bundle",
    art: "case",
    gallery: ["olive", "dark", "cream"],
    description:
      "A protective, pocket-friendly case in vegetable-tanned leather. Designed to age gracefully and fit every Riaf earbud model.",
    details: [
      "Vegetable-tanned leather",
      "Magnetic closure",
      "Cable pass-through",
      "Fits Buds Pro, Lite and Studio",
    ],
    features: [
      "Hand-finished edges",
      "Microfibre lining",
      "Integrated keyring",
      "One-year craftsmanship warranty",
    ],
    variantLabel: "Colour",
    variants: ["Olive", "Charcoal"],
    stock: 42,
    createdAt: "2025-09-20",
    popularity: 70,
  },
  {
    id: "braided-cable",
    slug: "riaf-braided-cable",
    name: "Riaf Braided Cable",
    tagline: "The last charging cable you will need.",
    category: "accessories",
    price: 19,
    rating: 4.6,
    reviews: 256,
    art: "cable",
    gallery: ["cream", "dark", "olive"],
    description:
      "A durable, tangle-resistant USB-C cable with a woven outer and reinforced connectors. Fast charges phones, buds and speakers.",
    details: [
      "1.5 metre length",
      "USB-C to USB-C",
      "100 W power delivery",
      "Braided nylon jacket",
    ],
    features: [
      "Reinforced strain relief",
      "Velcro cable tie included",
      "480 Mbps data transfer",
      "Two-year RIAF warranty",
    ],
    variantLabel: "Length",
    variants: ["1.5 m", "3 m"],
    stock: 64,
    createdAt: "2025-08-15",
    popularity: 62,
  },
  {
    id: "everyday-sling",
    slug: "riaf-everyday-sling",
    name: "Riaf Everyday Sling",
    tagline: "Carry less. Carry it well.",
    category: "accessories",
    price: 54,
    rating: 4.7,
    reviews: 318,
    badge: "New",
    art: "bag",
    gallery: ["dark", "olive", "beige"],
    description:
      "A compact crossbody bag with room for a phone, buds, notebook and keys. Water-resistant recycled canvas, softened with a cotton webbing strap.",
    details: [
      "2.5 litre capacity",
      "Water-resistant recycled canvas",
      "Adjustable webbing strap",
      "Hidden rear pocket",
    ],
    features: [
      "Magnetic quick-access flap",
      "Interior key clip",
      "Padded device sleeve",
      "One-year craftsmanship warranty",
    ],
    variantLabel: "Colour",
    variants: ["Charcoal", "Olive"],
    stock: 17,
    createdAt: "2026-01-05",
    popularity: 83,
  },
  {
    id: "frame-sunglasses",
    slug: "riaf-frame-sunglasses",
    name: "Riaf Frame Sunglasses",
    tagline: "A quiet frame for bright days.",
    category: "accessories",
    price: 72,
    rating: 4.5,
    reviews: 184,
    art: "sunglasses",
    gallery: ["beige", "dark", "olive"],
    description:
      "A lightweight, rounded frame in bio-acetate with polarised lenses. Understated from the front, considered from every angle.",
    details: [
      "Polarised UV400 lenses",
      "Bio-acetate frame",
      "24 g total weight",
      "Protective hard case included",
    ],
    features: [
      "Five-barrel hinges",
      "Anti-reflective coating",
      "Unisex fit",
      "One-year RIAF warranty",
    ],
    variantLabel: "Frame",
    variants: ["Sand", "Ink"],
    stock: 11,
    createdAt: "2025-11-28",
    popularity: 76,
  },
  {
    id: "everyday-hoodie",
    slug: "riaf-everyday-hoodie",
    name: "Riaf Everyday Hoodie",
    tagline: "Heavyweight calm, every day.",
    category: "fashion",
    price: 64,
    compareAt: 80,
    rating: 4.8,
    reviews: 926,
    badge: "Best seller",
    art: "hoodie",
    gallery: ["beige", "olive", "cream"],
    description:
      "A relaxed, heavyweight hoodie in brushed organic cotton. Dropped shoulders, a roomy hood and a fit that softens with every wash.",
    details: [
      "480 gsm brushed organic cotton",
      "Relaxed unisex fit",
      "Double-lined hood",
      "Kangaroo pocket",
    ],
    features: [
      "GOTS-certified cotton",
      "Pre-shrunk and garment-washed",
      "Tonal embroidered logo",
      "30-day easy returns",
    ],
    variantLabel: "Colour",
    variants: ["Oat", "Moss", "Ink"],
    stock: 21,
    createdAt: "2025-12-01",
    popularity: 88,
  },
  {
    id: "essential-tee",
    slug: "riaf-essential-tee",
    name: "Riaf Essential Tee",
    tagline: "The tee you reach for first.",
    category: "fashion",
    price: 32,
    rating: 4.7,
    reviews: 612,
    art: "tee",
    gallery: ["cream", "beige", "olive"],
    description:
      "A boxy, midweight tee with a clean neckline and a dry, soft hand feel. Cut to sit well on its own or under a hoodie.",
    details: [
      "220 gsm combed organic cotton",
      "Boxy unisex fit",
      "Ribbed crew neck",
      "Side-seamed construction",
    ],
    features: [
      "GOTS-certified cotton",
      "Pre-shrunk",
      "Tonal woven label",
      "30-day easy returns",
    ],
    variantLabel: "Size",
    variants: ["XS", "S", "M", "L", "XL"],
    stock: 55,
    createdAt: "2026-02-10",
    popularity: 72,
  },
  {
    id: "field-cap",
    slug: "riaf-field-cap",
    name: "Riaf Field Cap",
    tagline: "A six-panel, softened by hand.",
    category: "fashion",
    price: 28,
    rating: 4.5,
    reviews: 274,
    art: "cap",
    gallery: ["olive", "beige", "dark"],
    description:
      "An unstructured six-panel cap in washed cotton twill. Low profile, curved brim, and a brass adjuster at the back.",
    details: [
      "Washed cotton twill",
      "Unstructured six-panel crown",
      "Brass strap adjuster",
      "One size fits most",
    ],
    features: [
      "Pre-curved brim",
      "Embroidered eyelets",
      "Tonal RIAF mark",
      "30-day easy returns",
    ],
    variantLabel: "Colour",
    variants: ["Moss", "Sand", "Ink"],
    stock: 30,
    createdAt: "2025-10-18",
    popularity: 64,
  },
  {
    id: "studio-socks",
    slug: "riaf-studio-socks",
    name: "Riaf Studio Socks",
    tagline: "Three pairs of quiet comfort.",
    category: "fashion",
    price: 16,
    rating: 4.6,
    reviews: 388,
    art: "socks",
    gallery: ["cream", "beige", "olive"],
    description:
      "Ribbed crew socks in a soft organic cotton blend. A cushioned footbed and a smooth toe seam make them an easy everyday choice.",
    details: [
      "Three-pair pack",
      "Organic cotton blend",
      "Cushioned footbed",
      "Smooth toe seam",
    ],
    features: [
      "Ribbed cuff",
      "Tonal logo detail",
      "Machine washable",
      "30-day easy returns",
    ],
    variantLabel: "Size",
    variants: ["S/M", "L/XL"],
    stock: 48,
    createdAt: "2025-09-02",
    popularity: 58,
  },
  {
    id: "halo-lamp",
    slug: "riaf-halo-lamp",
    name: "Riaf Halo Lamp",
    tagline: "A warm circle for the evening.",
    category: "home",
    price: 96,
    rating: 4.8,
    reviews: 246,
    badge: "Editor's pick",
    art: "lamp",
    gallery: ["beige", "cream", "dark"],
    description:
      "A portable, dimmable table lamp with a soft linen shade and a warm, low-glare glow. Cordless for six hours, at home anywhere.",
    details: [
      "Dimmable warm LED",
      "Six-hour cordless battery",
      "Linen shade, powder-coated base",
      "USB-C charging",
    ],
    features: [
      "Three brightness levels",
      "Touch control",
      "Replaceable LED module",
      "Two-year RIAF warranty",
    ],
    variantLabel: "Finish",
    variants: ["Sand", "Chalk"],
    stock: 8,
    createdAt: "2025-11-11",
    popularity: 80,
  },
  {
    id: "stoneware-mug",
    slug: "riaf-stoneware-mug",
    name: "Riaf Stoneware Mug",
    tagline: "A heavier mug, on purpose.",
    category: "home",
    price: 24,
    rating: 4.7,
    reviews: 534,
    art: "mug",
    gallery: ["cream", "beige", "olive"],
    description:
      "A hand-glazed stoneware mug with a generous handle and a satisfying weight. The matte glaze reveals small variations from piece to piece.",
    details: [
      "350 ml capacity",
      "Hand-glazed stoneware",
      "Dishwasher and microwave safe",
      "Made in small batches",
    ],
    features: [
      "Comfort-grip handle",
      "Matte exterior, glazed interior",
      "Stackable design",
      "Food-safe glaze",
    ],
    variantLabel: "Glaze",
    variants: ["Chalk", "Oat", "Moss"],
    stock: 36,
    createdAt: "2025-08-24",
    popularity: 68,
  },
  {
    id: "cedar-candle",
    slug: "riaf-cedar-candle",
    name: "Riaf Cedar Candle",
    tagline: "Cedar, moss and a little smoke.",
    category: "home",
    price: 38,
    rating: 4.6,
    reviews: 302,
    badge: "New",
    art: "candle",
    gallery: ["olive", "beige", "cream"],
    description:
      "A hand-poured soy candle with notes of cedar, dry moss and a thread of smoke. Housed in a reusable stoneware vessel with a wooden lid.",
    details: [
      "220 g soy wax",
      "Approx. 45-hour burn",
      "Cotton wick",
      "Reusable stoneware vessel",
    ],
    features: [
      "Phthalate-free fragrance",
      "Hand-poured in small batches",
      "Wooden lid included",
      "Vegan and cruelty-free",
    ],
    variantLabel: "Scent",
    variants: ["Cedar & Moss", "Fig & Smoke"],
    stock: 14,
    createdAt: "2026-01-22",
    popularity: 75,
  },
  {
    id: "linen-throw",
    slug: "riaf-linen-throw",
    name: "Riaf Linen Throw",
    tagline: "A little more softness for the room.",
    category: "home",
    price: 88,
    rating: 4.7,
    reviews: 198,
    art: "throw",
    gallery: ["beige", "cream", "olive"],
    description:
      "A stonewashed linen throw with a hand-knotted fringe. Breathable in summer, warm enough for winter, and better with every wash.",
    details: [
      "100% European linen",
      "130 x 180 cm",
      "Hand-knotted fringe",
      "Stonewashed finish",
    ],
    features: [
      "OEKO-TEX certified",
      "Breathable and temperature regulating",
      "Machine washable",
      "30-day easy returns",
    ],
    variantLabel: "Colour",
    variants: ["Oat", "Chalk", "Moss"],
    stock: 6,
    createdAt: "2025-10-30",
    popularity: 66,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getCategory(slug: CategorySlug) {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryName(slug: CategorySlug) {
  return getCategory(slug)?.name ?? "Shop";
}

export function countByCategory(slug: CategorySlug) {
  return products.filter((product) => product.category === slug).length;
}

export function matchesQuery(product: Product, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    product.name,
    product.tagline,
    product.description,
    getCategoryName(product.category),
    product.badge ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return normalized
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

export function formatPrice(value: number) {
  return `$${value.toFixed(0)}`;
}

export function formatReviews(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getRelatedProducts(product: Product, limit = 4) {
  const sameCategory = products.filter(
    (item) => item.category === product.category && item.id !== product.id
  );
  const others = products.filter(
    (item) => item.category !== product.category && item.id !== product.id
  );

  return [...sameCategory, ...others]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export const featuredProducts = [
  "buds-pro",
  "everyday-hoodie",
  "halo-lamp",
  "everyday-sling",
]
  .map((id) => getProductById(id))
  .filter((product): product is Product => Boolean(product));

export const bestsellerProducts = [...products]
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 4);

export const heroProduct = getProductBySlug("riaf-buds-pro") ?? products[0];
