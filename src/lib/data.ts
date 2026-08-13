import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import catWomen from "@/assets/cat-women.jpg";
import catMen from "@/assets/cat-men.jpg";
import catOversized from "@/assets/cat-oversized.jpg";

export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
  group: "Collections" | "Clothing" | "Seasonal";
};

export type ProductColor = { name: string; hex: string };

export type ProductVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  stockCount: number;
  price: number;
  images: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAt?: number;
  images: string[];
  categories: string[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  inStock: boolean;
  inventoryStatus: "in_stock" | "low_stock" | "out_of_stock";
  inventoryUpdatedAt: string;
  rating: number;
  reviewCount: number;
  tags: ("new" | "best-seller" | "seasonal")[];
  fabric: string;
  description: string;
  details: string[];
};

const SIZES = ["XS", "S", "M", "L", "XL"];
const WAISTS = ["28", "30", "32", "34", "36", "38"];
const ONE_SIZE = ["One size"];

const NEUTRALS = [
  { name: "Ecru", hex: "#EFEAE1" },
  { name: "Stone", hex: "#C9C2B6" },
  { name: "Black", hex: "#111111" },
];

const brandInventoryTimestamp = "2026-08-13T00:00:00.000Z";

function buildVariants(
  productId: string,
  colors: ProductColor[],
  sizes: string[],
  stockTable: Record<string, Record<string, number>>,
  images: string[],
  price: number,
): ProductVariant[] {
  return colors.flatMap((color) =>
    sizes.map((size) => {
      const sizeStock = stockTable[color.name]?.[size] ?? 0;
      const variantId = `${productId}-${color.name.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`;
      return {
        id: variantId,
        sku: `LH-${productId}-${color.name.slice(0, 3).toUpperCase()}-${size}`,
        size,
        color: color.name,
        colorHex: color.hex,
        stockCount: sizeStock,
        price,
        images,
      };
    }),
  );
}

function normalizeProduct(
  product: Omit<Product, "colors" | "sizes" | "variants" | "inStock" | "inventoryStatus"> & {
    colors: ProductColor[];
    sizes: string[];
    variants?: ProductVariant[];
    inventoryUpdatedAt?: string;
  },
): Product {
  const variants =
    product.variants ??
    buildVariants(
      product.id,
      product.colors,
      product.sizes,
      Object.fromEntries(
        product.colors.map((color) => [
          color.name,
          Object.fromEntries(product.sizes.map((size) => [size, 5])),
        ]),
      ),
      product.images,
      product.price,
    );

  const totalStock = variants.reduce((sum, variant) => sum + Math.max(0, variant.stockCount), 0);
  const inStock = totalStock > 0;
  const inventoryStatus = totalStock === 0 ? "out_of_stock" : totalStock <= 8 ? "low_stock" : "in_stock";

  return {
    ...product,
    colors: product.colors,
    sizes: product.sizes,
    variants,
    inStock,
    inventoryStatus,
    inventoryUpdatedAt: product.inventoryUpdatedAt ?? brandInventoryTimestamp,
  };
}

export function getProductVariant(product: Product, size: string, color: string) {
  return product.variants.find((variant) => variant.size === size && variant.color === color) ?? null;
}

export function getDefaultVariant(product: Product) {
  return product.variants.find((variant) => variant.stockCount > 0) ?? product.variants[0] ?? null;
}

export const categories: Category[] = [
  {
    slug: "women",
    name: "Women",
    description:
      "Everyday cotton, denim and ethnic wear cut for Indian weather and long working days.",
    image: catWomen,
    group: "Collections",
  },
  {
    slug: "men",
    name: "Men",
    description: "Tees, shirts and denim built on honest cotton and clean, simple cuts.",
    image: catMen,
    group: "Collections",
  },
  {
    slug: "tshirts",
    name: "T-Shirts",
    description:
      "Combed cotton knitwear from Tirupur — India's knitwear capital — in regular and oversized fits.",
    image: catOversized,
    group: "Clothing",
  },
  {
    slug: "denim",
    name: "Denim",
    description: "Mill-woven denim from Ahmedabad and Bhilwara, finished in true-to-size fits.",
    image: p3,
    group: "Clothing",
  },
  {
    slug: "ethnic",
    name: "Ethnic Wear",
    description: "Sarees, kurta sets and festive pieces sourced from the looms of Surat.",
    image: p5,
    group: "Clothing",
  },
  {
    slug: "woollens",
    name: "Woollens",
    description: "Sweaters and cardigans knitted in Ludhiana for north Indian winters.",
    image: p4,
    group: "Seasonal",
  },
  {
    slug: "home",
    name: "Home Textiles",
    description: "Bedsheets, throws and towels woven in Panipat, the country's textile recycler.",
    image: p8,
    group: "Clothing",
  },
  {
    slug: "casual",
    name: "Casual",
    description: "The uncomplicated everyday pieces you reach for before anything else.",
    image: p1,
    group: "Clothing",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Handloom stoles, scarves and the small finishing details.",
    image: p7,
    group: "Clothing",
  },
  {
    slug: "summer",
    name: "Summer",
    description: "Breathable cotton and open weaves for the long Indian summer.",
    image: p2,
    group: "Seasonal",
  },
  {
    slug: "winter",
    name: "Winter",
    description: "Wool blends, layers and quilted warmth for the Meerut cold snap.",
    image: p6,
    group: "Seasonal",
  },
];

const rawProducts = [
  {
    id: "1",
    slug: "tirupur-classic-cotton-tee",
    name: "Tirupur Classic Cotton T-Shirt",
    price: 799,
    compareAt: 1099,
    images: [p1, p2],
    categories: ["tshirts", "men", "women", "casual", "summer"],
    colors: NEUTRALS,
    sizes: SIZES,
    inventoryUpdatedAt: brandInventoryTimestamp,
    rating: 4.8,
    reviewCount: 412,
    tags: ["best-seller", "new"],
    fabric: "180 GSM combed cotton, bio-washed",
    description:
      "Our everyday tee, knitted and stitched in Tirupur from 180 GSM combed cotton. Bio-washed so it stays soft from the first wear, with a ribbed collar that holds its shape through a hard summer.",
    details: [
      "Regular fit",
      "Ribbed collar with shoulder-to-shoulder tape",
      "Knitted and stitched in Tirupur, Tamil Nadu",
      "Machine wash cold, do not bleach",
    ],
    variants: buildVariants(
      "1",
      NEUTRALS,
      SIZES,
      {
        Ecru: { XS: 12, S: 18, M: 20, L: 15, XL: 10 },
        Stone: { XS: 8, S: 14, M: 16, L: 12, XL: 7 },
        Black: { XS: 6, S: 10, M: 12, L: 8, XL: 4 },
      },
      [p1, p2],
      799,
    ),
  },
  {
    id: "2",
    slug: "oversized-drop-shoulder-tee",
    name: "Oversized Drop-Shoulder Tee",
    price: 1099,
    images: [p2, p1],
    categories: ["tshirts", "women", "casual", "summer"],
    colors: [
      { name: "Off White", hex: "#F2EFE9" },
      { name: "Charcoal", hex: "#3A3A3A" },
    ],
    sizes: SIZES,
    rating: 4.7,
    reviewCount: 236,
    tags: ["new"],
    fabric: "220 GSM heavyweight cotton",
    description:
      "A deliberately roomy tee in 220 GSM cotton with a dropped shoulder and a boxy body. Heavy enough to hold its line, light enough for a Delhi afternoon.",
    details: [
      "Oversized fit — size down for a cleaner line",
      "Dropped shoulder, boxy body",
      "Garment-dyed and pre-shrunk",
      "Machine wash cold, inside out",
    ],
    variants: buildVariants(
      "2",
      [
        { name: "Off White", hex: "#F2EFE9" },
        { name: "Charcoal", hex: "#3A3A3A" },
      ],
      SIZES,
      {
        "Off White": { XS: 7, S: 12, M: 15, L: 11, XL: 8 },
        Charcoal: { XS: 5, S: 11, M: 13, L: 10, XL: 6 },
      },
      [p2, p1],
      1099,
    ),
  },
  {
    id: "3",
    slug: "ahmedabad-straight-fit-jeans",
    name: "Ahmedabad Straight-Fit Jeans",
    price: 1899,
    compareAt: 2399,
    images: [p3, p4],
    categories: ["denim", "men", "casual"],
    colors: [
      { name: "Mid Indigo", hex: "#3C5878" },
      { name: "Jet Black", hex: "#1A1A1A" },
    ],
    sizes: WAISTS,
    rating: 4.6,
    reviewCount: 187,
    tags: ["best-seller"],
    fabric: "13.5 oz cotton denim with 2% stretch",
    description:
      "Straight through the thigh with a clean, unfussy leg. Woven on Ahmedabad mill denim, stone-washed for a broken-in feel without the fade lines.",
    details: [
      "Mid rise, straight fit",
      "Five-pocket construction, YKK zip",
      "Denim woven in Ahmedabad, Gujarat",
      "Machine wash cold, inside out",
    ],
    variants: buildVariants(
      "3",
      [
        { name: "Mid Indigo", hex: "#3C5878" },
        { name: "Jet Black", hex: "#1A1A1A" },
      ],
      WAISTS,
      {
        "Mid Indigo": { "28": 4, "30": 8, "32": 10, "34": 8, "36": 5, "38": 3 },
        "Jet Black": { "28": 3, "30": 7, "32": 9, "34": 7, "36": 4, "38": 2 },
      },
      [p3, p4],
      1899,
    ),
  },
  {
    id: "4",
    slug: "bhilwara-high-rise-jeans",
    name: "Bhilwara High-Rise Jeans",
    price: 2099,
    images: [p4, p3],
    categories: ["denim", "women", "casual"],
    colors: [
      { name: "Light Wash", hex: "#8FA6BE" },
      { name: "Deep Indigo", hex: "#2E4463" },
    ],
    sizes: WAISTS,
    rating: 4.7,
    reviewCount: 143,
    tags: ["new", "best-seller"],
    fabric: "12 oz Bhilwara denim with 3% elastane",
    description:
      "A high-rise jean cut to sit at the waist without gaping, with a slight taper below the knee. Enough stretch for a full day, enough weight to keep its shape.",
    details: [
      "High rise, tapered leg",
      "Contoured waistband",
      "Denim from Bhilwara, Rajasthan",
      "Machine wash cold, line dry",
    ],
    variants: buildVariants(
      "4",
      [
        { name: "Light Wash", hex: "#8FA6BE" },
        { name: "Deep Indigo", hex: "#2E4463" },
      ],
      WAISTS,
      {
        "Light Wash": { "28": 5, "30": 7, "32": 9, "34": 6, "36": 3, "38": 2 },
        "Deep Indigo": { "28": 4, "30": 7, "32": 8, "34": 7, "36": 5, "38": 2 },
      },
      [p4, p3],
      2099,
    ),
  },
  {
    id: "5",
    slug: "surat-georgette-saree",
    name: "Surat Georgette Saree",
    price: 2499,
    compareAt: 3200,
    images: [p5, p2],
    categories: ["ethnic", "women"],
    colors: [
      { name: "Deep Maroon", hex: "#6E1F2A" },
      { name: "Ivory", hex: "#EFE9DE" },
    ],
    sizes: ONE_SIZE,
    rating: 4.9,
    reviewCount: 168,
    tags: ["best-seller", "seasonal"],
    fabric: "Poly-georgette with zari border",
    description:
      "Six and a half metres of fluid georgette from the Surat looms, finished with a fine zari border and matching unstitched blouse piece. Drapes cleanly and travels without creasing.",
    details: [
      "6.3 m saree with 0.8 m blouse piece",
      "Zari border, machine-finished edges",
      "Woven and finished in Surat, Gujarat",
      "Dry clean recommended",
    ],
    variants: buildVariants(
      "5",
      [
        { name: "Deep Maroon", hex: "#6E1F2A" },
        { name: "Ivory", hex: "#EFE9DE" },
      ],
      ONE_SIZE,
      {
        "Deep Maroon": { "One size": 6 },
        Ivory: { "One size": 8 },
      },
      [p5, p2],
      2499,
    ),
  },
  {
    id: "6",
    slug: "surat-anarkali-kurta-set",
    name: "Surat Anarkali Kurta Set",
    price: 2899,
    images: [catWomen, p5],
    categories: ["ethnic", "women", "summer"],
    colors: [
      { name: "Powder Blue", hex: "#B7C7D6" },
      { name: "Clay", hex: "#C08A6E" },
    ],
    sizes: SIZES,
    rating: 4.8,
    reviewCount: 91,
    tags: ["new"],
    fabric: "Cotton-viscose blend with chikan-style embroidery",
    description:
      "A flared anarkali with a soft V neckline, three-quarter sleeves and a printed dupatta. Light enough for a long function, structured enough to hold the flare.",
    details: [
      "Kurta, churidar and dupatta included",
      "Side pockets, concealed zip",
      "Stitched in Surat, Gujarat",
      "Gentle machine wash, dry in shade",
    ],
    variants: buildVariants(
      "6",
      [
        { name: "Powder Blue", hex: "#B7C7D6" },
        { name: "Clay", hex: "#C08A6E" },
      ],
      SIZES,
      {
        "Powder Blue": { XS: 6, S: 9, M: 8, L: 7, XL: 4 },
        Clay: { XS: 5, S: 8, M: 7, L: 6, XL: 3 },
      },
      [catWomen, p5],
      2899,
    ),
  },
  {
    id: "7",
    slug: "ludhiana-merino-crew-sweater",
    name: "Ludhiana Merino Crew Sweater",
    price: 1799,
    images: [p6, p4],
    categories: ["woollens", "men", "winter"],
    colors: [
      { name: "Oatmeal", hex: "#DCD3C3" },
      { name: "Bottle Green", hex: "#2F4A3C" },
    ],
    sizes: SIZES,
    rating: 4.6,
    reviewCount: 204,
    tags: ["best-seller", "seasonal"],
    fabric: "70% merino wool, 30% acrylic",
    description:
      "A fine-gauge crew knitted in Ludhiana, warm enough for a north Indian December and thin enough to layer under a jacket. Ribbed cuffs and hem hold their shape.",
    details: [
      "Regular fit",
      "Fine 12-gauge knit",
      "Knitted in Ludhiana, Punjab",
      "Hand wash cool, dry flat",
    ],
    variants: buildVariants(
      "7",
      [
        { name: "Oatmeal", hex: "#DCD3C3" },
        { name: "Bottle Green", hex: "#2F4A3C" },
      ],
      SIZES,
      {
        Oatmeal: { XS: 5, S: 8, M: 10, L: 8, XL: 4 },
        "Bottle Green": { XS: 4, S: 7, M: 9, L: 7, XL: 3 },
      },
      [p6, p4],
      1799,
    ),
  },
  {
    id: "8",
    slug: "ludhiana-long-cardigan",
    name: "Ludhiana Long Cardigan",
    price: 2199,
    compareAt: 2699,
    images: [catOversized, p6],
    categories: ["woollens", "women", "winter"],
    colors: [
      { name: "Camel", hex: "#B48450" },
      { name: "Grey Melange", hex: "#B9BDC1" },
    ],
    sizes: SIZES,
    rating: 4.7,
    reviewCount: 76,
    tags: ["seasonal"],
    fabric: "Wool-blend chunky knit",
    description:
      "A long, open-front cardigan with deep patch pockets and a soft shoulder. The kind of layer that lives on the back of a chair from November to February.",
    details: [
      "Relaxed fit, mid-thigh length",
      "Two patch pockets, no closure",
      "Knitted in Ludhiana, Punjab",
      "Hand wash cool, dry flat",
    ],
    variants: buildVariants(
      "8",
      [
        { name: "Camel", hex: "#B48450" },
        { name: "Grey Melange", hex: "#B9BDC1" },
      ],
      SIZES,
      {
        Camel: { XS: 3, S: 7, M: 9, L: 7, XL: 4 },
        "Grey Melange": { XS: 2, S: 6, M: 8, L: 6, XL: 3 },
      },
      [catOversized, p6],
      2199,
    ),
  },
  {
    id: "9",
    slug: "panipat-cotton-bedsheet-set",
    name: "Panipat Cotton Bedsheet Set",
    price: 1499,
    images: [p8, p7],
    categories: ["home"],
    colors: [
      { name: "Ivory", hex: "#EFE9DE" },
      { name: "Sage", hex: "#A8B3A0" },
    ],
    sizes: ["Single", "Double", "King"],
    rating: 4.8,
    reviewCount: 259,
    tags: ["best-seller"],
    fabric: "220 TC 100% cotton percale",
    description:
      "A 220 thread-count percale set woven in Panipat — one flat sheet and two pillow covers. Crisp on the first night, softer with every wash.",
    details: [
      "1 bedsheet + 2 pillow covers",
      "Fits mattresses up to 10 inches deep",
      "Woven in Panipat, Haryana",
      "Machine wash warm, tumble dry low",
    ],
    variants: buildVariants(
      "9",
      [
        { name: "Ivory", hex: "#EFE9DE" },
        { name: "Sage", hex: "#A8B3A0" },
      ],
      ["Single", "Double", "King"],
      {
        Ivory: { Single: 8, Double: 11, King: 6 },
        Sage: { Single: 7, Double: 10, King: 5 },
      },
      [p8, p7],
      1499,
    ),
  },
  {
    id: "10",
    slug: "panipat-handloom-throw",
    name: "Panipat Handloom Throw",
    price: 1199,
    images: [p7, p8],
    categories: ["home", "winter"],
    colors: [
      { name: "Taupe", hex: "#B39C86" },
      { name: "Indigo", hex: "#33445E" },
    ],
    sizes: ONE_SIZE,
    rating: 4.9,
    reviewCount: 64,
    tags: ["seasonal"],
    fabric: "Recycled cotton handloom weave",
    description:
      "Woven on a handloom from recycled cotton yarn, with a hand-knotted fringe. Wide enough for a sofa, light enough to carry to the terrace.",
    details: [
      "150 × 200 cm",
      "Hand-knotted fringe",
      "Handloom woven in Panipat, Haryana",
      "Machine wash gentle, dry in shade",
    ],
    variants: buildVariants(
      "10",
      [
        { name: "Taupe", hex: "#B39C86" },
        { name: "Indigo", hex: "#33445E" },
      ],
      ONE_SIZE,
      {
        Taupe: { "One size": 0 },
        Indigo: { "One size": 0 },
      },
      [p7, p8],
      1199,
    ),
  },
  {
    id: "11",
    slug: "cotton-poplin-casual-shirt",
    name: "Cotton Poplin Casual Shirt",
    price: 1299,
    images: [catMen, p3],
    categories: ["men", "casual", "summer"],
    colors: [
      { name: "White", hex: "#F4F2ED" },
      { name: "Slate", hex: "#6E7176" },
    ],
    sizes: SIZES,
    rating: 4.5,
    reviewCount: 118,
    tags: ["new"],
    fabric: "100% cotton poplin",
    description:
      "A clean poplin shirt with a soft-roll collar and a single chest pocket. Cut slightly relaxed so it stays comfortable buttoned through a working day.",
    details: [
      "Relaxed fit",
      "Soft-roll collar, single chest pocket",
      "Stitched in Delhi NCR",
      "Machine wash cold, iron warm",
    ],
    variants: buildVariants(
      "11",
      [
        { name: "White", hex: "#F4F2ED" },
        { name: "Slate", hex: "#6E7176" },
      ],
      SIZES,
      {
        White: { XS: 6, S: 9, M: 11, L: 10, XL: 6 },
        Slate: { XS: 4, S: 7, M: 9, L: 8, XL: 5 },
      },
      [catMen, p3],
      1299,
    ),
  },
  {
    id: "12",
    slug: "handloom-cotton-stole",
    name: "Handloom Cotton Stole",
    price: 649,
    images: [p1, p5],
    categories: ["accessories", "women", "summer"],
    colors: [
      { name: "Bone", hex: "#EDE7DB" },
      { name: "Rust", hex: "#A45A38" },
    ],
    sizes: ONE_SIZE,
    rating: 4.6,
    reviewCount: 87,
    tags: ["new"],
    fabric: "100% handloom cotton",
    description:
      "A light handloom stole with a slubby texture and a plain selvedge. Useful in the sun, useful in over-cooled offices.",
    details: [
      "70 × 200 cm",
      "Plain selvedge, no fringe",
      "Handloom woven in Uttar Pradesh",
      "Hand wash separately first time",
    ],
    variants: buildVariants(
      "12",
      [
        { name: "Bone", hex: "#EDE7DB" },
        { name: "Rust", hex: "#A45A38" },
      ],
      ONE_SIZE,
      {
        Bone: { "One size": 9 },
        Rust: { "One size": 7 },
      },
      [p1, p5],
      649,
    ),
  },
].map(normalizeProduct);

export const products: Product[] = rawProducts;

export const bestSellers = products.filter((p) => p.tags.includes("best-seller"));
export const newArrivals = products.filter((p) => p.tags.includes("new"));
export const seasonal = products.filter((p) => p.tags.includes("seasonal"));

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function productsInCategory(slug: string) {
  return products.filter((p) => p.categories.includes(slug));
}

export const allColors = Array.from(
  new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values(),
);

export const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes)));

export type Review = {
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

export const reviews: Review[] = [
  {
    name: "Ritika S.",
    location: "Meerut",
    rating: 5,
    title: "The tee I keep re-ordering",
    body: "I've washed the Tirupur tee dozens of times and the collar still sits flat. Ordered four more for the family.",
    date: "12 January 2026",
  },
  {
    name: "Arjun M.",
    location: "Delhi",
    rating: 5,
    title: "Denim that actually fits",
    body: "The Ahmedabad straight fit is exactly as described — no gimmick washes, honest weight, and the length was right off the shelf.",
    date: "3 December 2025",
  },
  {
    name: "Sneha P.",
    location: "Lucknow",
    rating: 4,
    title: "Lovely saree, quick delivery",
    body: "The georgette drapes beautifully and the zari border looks far more expensive than it was. Reached me in three days.",
    date: "27 November 2025",
  },
];

export const galleryImages = [
  { src: p1, alt: "Combed cotton T-shirt from our Tirupur knitwear line" },
  { src: catOversized, alt: "Oversized drop-shoulder tee in sand" },
  { src: p5, alt: "Georgette saree photographed in studio" },
  { src: p7, alt: "Handloom cotton stole folded on a neutral backdrop" },
  { src: p4, alt: "Bhilwara denim jeans in a light wash" },
  { src: catMen, alt: "Cotton poplin casual shirt with straight-fit denim" },
];
