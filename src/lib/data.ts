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

export const categories: Category[] = [
  {
    slug: "women",
    name: "Women",
    description:
      "Fluid tailoring, considered knitwear and everyday pieces cut from natural fibres.",
    image: catWomen,
    group: "Collections",
  },
  {
    slug: "men",
    name: "Men",
    description:
      "Quiet tailoring and softly structured staples built for a long working week.",
    image: catMen,
    group: "Collections",
  },
  {
    slug: "oversized",
    name: "Oversized",
    description: "Generous volumes, dropped shoulders and fabrics with real weight.",
    image: catOversized,
    group: "Clothing",
  },
  {
    slug: "streetwear",
    name: "Streetwear",
    description: "Loop-back cottons and relaxed silhouettes made for city days.",
    image: p6,
    group: "Clothing",
  },
  {
    slug: "casual",
    name: "Casual",
    description: "The uncomplicated pieces you reach for before anything else.",
    image: p1,
    group: "Clothing",
  },
  {
    slug: "formal",
    name: "Formal",
    description: "Evening and occasion dressing, stripped back to line and drape.",
    image: p5,
    group: "Clothing",
  },
  {
    slug: "summer",
    name: "Summer",
    description: "Airy linens and open weaves in sun-washed neutrals.",
    image: p2,
    group: "Seasonal",
  },
  {
    slug: "winter",
    name: "Winter",
    description: "Heavyweight wool, brushed alpaca and coats made to be kept.",
    image: p4,
    group: "Seasonal",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Leather, cashmere and canvas — the finishing details.",
    image: p8,
    group: "Clothing",
  },
  {
    slug: "shoes",
    name: "Shoes",
    description: "Italian-made leather footwear with clean, unbranded lines.",
    image: p7,
    group: "Clothing",
  },
];

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAt?: number;
  images: string[];
  categories: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  tags: ("new" | "best-seller" | "seasonal")[];
  fabric: string;
  description: string;
  details: string[];
};

const SIZES = ["XS", "S", "M", "L", "XL"];
const SHOE_SIZES = ["39", "40", "41", "42", "43", "44"];

const NEUTRALS = [
  { name: "Ecru", hex: "#EFEAE1" },
  { name: "Stone", hex: "#C9C2B6" },
  { name: "Black", hex: "#111111" },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "elin-oversized-poplin-shirt",
    name: "Elin Oversized Poplin Shirt",
    price: 129,
    compareAt: 169,
    images: [p1, p2],
    categories: ["women", "oversized", "casual", "summer"],
    colors: NEUTRALS,
    sizes: SIZES,
    inStock: true,
    rating: 4.8,
    reviewCount: 126,
    tags: ["best-seller", "new"],
    fabric: "100% organic cotton poplin",
    description:
      "A deliberately generous shirt cut from crisp organic poplin, with a dropped shoulder, curved hem and a single chest pocket. Wear it buttoned and tucked, or open over a fine-gauge knit.",
    details: [
      "Oversized fit — size down for a cleaner line",
      "Mother-of-pearl buttons",
      "Woven in Portugal from GOTS-certified cotton",
      "Machine wash cold, line dry",
    ],
  },
  {
    id: "2",
    slug: "hanne-double-faced-wool-coat",
    name: "Hanne Double-Faced Wool Coat",
    price: 495,
    images: [p2, p1],
    categories: ["women", "winter", "formal"],
    colors: [
      { name: "Camel", hex: "#B48450" },
      { name: "Charcoal", hex: "#3A3A3A" },
    ],
    sizes: SIZES,
    inStock: true,
    rating: 4.9,
    reviewCount: 84,
    tags: ["best-seller", "seasonal"],
    fabric: "84% virgin wool, 16% cashmere",
    description:
      "Our winter anchor. Double-faced wool and cashmere is cut long and lean with a soft shoulder, hidden double-breasted closure and deep welt pockets. Unlined, so it moves with you.",
    details: [
      "Regular fit, mid-calf length",
      "Hand-finished edges, no lining",
      "Tailored in Italy",
      "Dry clean only",
    ],
  },
  {
    id: "3",
    slug: "otto-relaxed-wool-trousers",
    name: "Otto Relaxed Wool Trousers",
    price: 185,
    images: [p3, p4],
    categories: ["men", "formal", "winter"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Slate", hex: "#6E7176" },
    ],
    sizes: SIZES,
    inStock: true,
    rating: 4.7,
    reviewCount: 61,
    tags: ["best-seller"],
    fabric: "100% tropical wool",
    description:
      "A single-pleat trouser in a fluid tropical wool, cut wide through the thigh and tapered just above the ankle. Comfortable enough for a long commute, sharp enough for the evening.",
    details: [
      "Relaxed fit with single forward pleat",
      "Side adjusters, no belt required",
      "Unfinished hem for tailoring",
      "Dry clean only",
    ],
  },
  {
    id: "4",
    slug: "lund-waffle-knit-sweater",
    name: "Lund Waffle-Knit Sweater",
    price: 165,
    compareAt: 210,
    images: [p4, p3],
    categories: ["men", "winter", "casual", "oversized"],
    colors: [
      { name: "Oatmeal", hex: "#DCD3C3" },
      { name: "Moss", hex: "#7C7F6C" },
    ],
    sizes: SIZES,
    inStock: true,
    rating: 4.6,
    reviewCount: 209,
    tags: ["best-seller", "seasonal"],
    fabric: "70% lambswool, 30% recycled nylon",
    description:
      "Chunky waffle stitch in a lambswool blend that softens with every wear. Ribbed collar, cuffs and hem hold their shape season after season.",
    details: [
      "Relaxed fit",
      "Fully fashioned shoulders",
      "Knitted in Scotland",
      "Hand wash cool, dry flat",
    ],
  },
  {
    id: "5",
    slug: "vera-bias-cut-midi-dress",
    name: "Vera Bias-Cut Midi Dress",
    price: 249,
    images: [p5, p2],
    categories: ["women", "formal", "summer"],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Bone", hex: "#E7E1D6" },
    ],
    sizes: SIZES,
    inStock: true,
    rating: 4.9,
    reviewCount: 147,
    tags: ["new"],
    fabric: "100% sandwashed viscose",
    description:
      "Cut on the bias so it falls without pulling, with an asymmetric neckline and a discreet side slit. The kind of dress that reads as effortless because the pattern work is not.",
    details: [
      "True to size, skims the body",
      "Asymmetric single strap",
      "Concealed side zip",
      "Dry clean only",
    ],
  },
  {
    id: "6",
    slug: "kavi-heavyweight-hoodie",
    name: "Kavi Heavyweight Hoodie",
    price: 145,
    images: [p6, p4],
    categories: ["men", "streetwear", "oversized", "casual"],
    colors: [
      { name: "Grey Melange", hex: "#B9BDC1" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: SIZES,
    inStock: true,
    rating: 4.8,
    reviewCount: 312,
    tags: ["best-seller"],
    fabric: "480gsm loop-back cotton",
    description:
      "A 480gsm loop-back hoodie with a boxy body, double-layer hood and matte metal eyelets. Garment-dyed for depth of colour that holds through repeated washing.",
    details: [
      "Oversized fit",
      "Reinforced flatlock seams",
      "Garment-dyed and pre-shrunk",
      "Machine wash cold, inside out",
    ],
  },
  {
    id: "7",
    slug: "mera-leather-sneaker",
    name: "Mera Leather Sneaker",
    price: 215,
    images: [p7, p8],
    categories: ["shoes", "women", "men", "casual"],
    colors: [
      { name: "Off White", hex: "#F2EFE9" },
      { name: "Sand", hex: "#D9C7AC" },
    ],
    sizes: SHOE_SIZES,
    inStock: true,
    rating: 4.7,
    reviewCount: 98,
    tags: ["new", "best-seller"],
    fabric: "Vegetable-tanned Italian calf leather",
    description:
      "A low-profile sneaker with no visible branding, built on a slim vulcanised sole. Vegetable-tanned calf leather creases and patinas rather than cracks.",
    details: [
      "Fits true to size",
      "Removable cushioned footbed",
      "Made in Le Marche, Italy",
      "Wipe clean with a soft cloth",
    ],
  },
  {
    id: "8",
    slug: "aro-cashmere-scarf",
    name: "Aro Cashmere Scarf",
    price: 135,
    compareAt: 160,
    images: [p8, p7],
    categories: ["accessories", "winter", "women", "men"],
    colors: [
      { name: "Taupe", hex: "#B39C86" },
      { name: "Ivory", hex: "#EFE9DE" },
    ],
    sizes: ["One size"],
    inStock: true,
    rating: 4.9,
    reviewCount: 74,
    tags: ["seasonal"],
    fabric: "100% Mongolian cashmere",
    description:
      "Brushed cashmere with a hand-knotted fringe, woven wide enough to double as a wrap on a cold platform. Light, warm, and quietly luxurious.",
    details: ["200 × 70 cm", "Hand-knotted fringe", "Woven in Nepal", "Dry clean only"],
  },
  {
    id: "9",
    slug: "sylt-linen-tunic-dress",
    name: "Sylt Linen Tunic Dress",
    price: 189,
    images: [catWomen, p5],
    categories: ["women", "summer", "casual"],
    colors: [
      { name: "Ivory", hex: "#F1ECE2" },
      { name: "Clay", hex: "#C08A6E" },
    ],
    sizes: SIZES,
    inStock: true,
    rating: 4.8,
    reviewCount: 53,
    tags: ["new", "seasonal"],
    fabric: "100% European washed linen",
    description:
      "A softly belted tunic in washed European linen with a deep V neckline and cap sleeves. Loose enough to be cool, structured enough to hold a line.",
    details: [
      "Relaxed fit with removable belt",
      "Side seam pockets",
      "Pre-washed for softness",
      "Machine wash cold",
    ],
  },
  {
    id: "10",
    slug: "bergen-stand-collar-overcoat",
    name: "Bergen Stand-Collar Overcoat",
    price: 620,
    images: [catMen, p3],
    categories: ["men", "winter", "formal"],
    colors: [
      { name: "Charcoal", hex: "#3B3D40" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: SIZES,
    inStock: false,
    rating: 5,
    reviewCount: 41,
    tags: ["seasonal"],
    fabric: "90% wool, 10% cashmere melton",
    description:
      "A long stand-collar coat in dense wool melton, cut with a straight body and welt pockets set high. Substantial without weight.",
    details: [
      "Regular fit, below knee",
      "Half-canvassed construction",
      "Tailored in Portugal",
      "Dry clean only",
    ],
  },
  {
    id: "11",
    slug: "nord-wide-leg-sweatpant",
    name: "Nord Wide-Leg Sweatpant",
    price: 125,
    images: [catOversized, p6],
    categories: ["streetwear", "oversized", "women", "casual"],
    colors: [
      { name: "Sand", hex: "#D8CDBB" },
      { name: "Grey", hex: "#B7B9BB" },
    ],
    sizes: SIZES,
    inStock: true,
    rating: 4.6,
    reviewCount: 168,
    tags: ["best-seller", "new"],
    fabric: "440gsm brushed cotton fleece",
    description:
      "Full-length, wide through the leg and gathered at a covered elastic waist. Brushed on the inside for warmth without bulk.",
    details: [
      "Oversized fit",
      "Covered elastic waist with internal drawcord",
      "Side seam pockets",
      "Machine wash cold",
    ],
  },
  {
    id: "12",
    slug: "ines-silk-blend-shirt",
    name: "Ines Silk-Blend Shirt",
    price: 175,
    images: [p1, p5],
    categories: ["women", "formal", "casual"],
    colors: [
      { name: "Bone", hex: "#EDE7DB" },
      { name: "Ink", hex: "#232733" },
    ],
    sizes: SIZES,
    inStock: true,
    rating: 4.5,
    reviewCount: 39,
    tags: ["new"],
    fabric: "55% silk, 45% viscose",
    description:
      "A fluid shirt with a soft-roll collar and French seams throughout. The silk blend keeps the drape while surviving an ordinary week.",
    details: [
      "Regular fit",
      "French seams, self-covered buttons",
      "Made in Italy",
      "Hand wash cool or dry clean",
    ],
  },
];

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
    name: "Marguerite L.",
    location: "Copenhagen",
    rating: 5,
    title: "The coat I stopped looking for",
    body: "I bought the Hanne coat two winters ago and it still looks new. The wool has softened rather than pilled, and the cut works over both a suit and a heavy knit.",
    date: "12 January 2026",
  },
  {
    name: "Tomás R.",
    location: "Lisbon",
    rating: 5,
    title: "Tailoring that actually fits",
    body: "The Otto trousers arrived unhemmed, which I appreciated. My tailor said the wool was better than anything he'd seen at this price.",
    date: "3 December 2025",
  },
  {
    name: "Aiko N.",
    location: "Tokyo",
    rating: 4,
    title: "Beautiful poplin, size down",
    body: "The oversized shirt is genuinely oversized. I took a size down and it falls perfectly. The fabric has real body without feeling stiff.",
    date: "27 November 2025",
  },
];

export const galleryImages = [
  { src: p1, alt: "Model wearing the Elin oversized poplin shirt" },
  { src: catOversized, alt: "Sand-toned hooded sweatshirt and wide trousers" },
  { src: p5, alt: "Black bias-cut midi dress photographed in studio" },
  { src: p7, alt: "Off-white leather sneakers on a sand backdrop" },
  { src: p4, alt: "Oatmeal waffle-knit sweater" },
  { src: catMen, alt: "Charcoal stand-collar overcoat with grey trousers" },
];
