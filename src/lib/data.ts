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
const WAISTS = ["28", "30", "32", "34", "36", "38"];

const NEUTRALS = [
  { name: "Ecru", hex: "#EFEAE1" },
  { name: "Stone", hex: "#C9C2B6" },
  { name: "Black", hex: "#111111" },
];

export const products: Product[] = [
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    sizes: ["One size"],
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    sizes: ["One size"],
    inStock: false,
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
    inStock: true,
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
    sizes: ["One size"],
    inStock: true,
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
