import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Minus, Plus, Truck, RotateCcw, Ruler } from "lucide-react";
import { toast } from "sonner";
import {
  getDefaultVariant,
  getProduct,
  getProductVariant,
  products,
  reviews as globalReviews,
  type Product,
} from "@/lib/data";
import { formatPrice, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { StarRating } from "@/components/site/StarRating";
import { Reveal } from "@/components/site/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — LOUIE HERITAGE" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — LOUIE HERITAGE`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  component: ProductPage,
});

const sizeGuide = [
  ["XS", "82–86", "62–66", "88–92"],
  ["S", "86–90", "66–70", "92–96"],
  ["M", "90–96", "70–76", "96–102"],
  ["L", "96–102", "76–82", "102–108"],
  ["XL", "102–110", "82–90", "108–116"],
];

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { addToCart, toggleWishlist, isWishlisted, markViewed, recentlyViewed } = useShop();

  const defaultVariant = getDefaultVariant(product) ?? product.variants[0] ?? null;
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(defaultVariant?.size ?? product.sizes[0]!);
  const [color, setColor] = useState(defaultVariant?.color ?? product.colors[0]!.name);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const nextDefault = getDefaultVariant(product) ?? product.variants[0] ?? null;
    setActive(0);
    setSize(nextDefault?.size ?? product.sizes[0]!);
    setColor(nextDefault?.color ?? product.colors[0]!.name);
    setQuantity(1);
    markViewed(product.id);
  }, [product, markViewed]);

  const selectedVariant = getProductVariant(product, size, color) ?? defaultVariant;
  const selectedVariantInStock = Boolean(selectedVariant && selectedVariant.stockCount > 0);
  const wishlisted = isWishlisted(product.id);
  const gallery = product.images.length > 1 ? product.images : [product.images[0]!, product.images[0]!];
  const related = products
    .filter((p) => p.id !== product.id && p.categories.some((c) => product.categories.includes(c)))
    .slice(0, 4);
  const viewed = recentlyViewed
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <>
      <div className="container-editorial py-6">
        <Breadcrumbs
          items={[
            { label: "Shop", to: "/shop" },
            { label: product.name },
          ]}
        />
      </div>

      <article className="container-editorial grid gap-10 pb-24 lg:grid-cols-12 lg:gap-20">
        {/* Gallery */}
        <div className="lg:col-span-7">
          {/* Desktop: stacked editorial column. Mobile: single frame + thumbnails. */}
          <div className="hidden gap-3 md:grid">
            {gallery.map((image, i) => (
              <div key={i} className="overflow-hidden rounded-[3px] bg-secondary">
                <img
                  src={image}
                  alt={i === 0 ? product.name : ""}
                  width={900}
                  height={1200}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="md:hidden">
            <div className="overflow-hidden rounded-[3px] bg-secondary">
              <img
                src={gallery[active]}
                alt={product.name}
                width={900}
                height={1200}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="mt-3 flex gap-2">
              {gallery.map((image, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "w-14 overflow-hidden rounded-[3px] border transition-colors",
                    active === i ? "border-foreground" : "border-transparent",
                  )}
                >
                  <img
                    src={image}
                    alt=""
                    width={900}
                    height={1200}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">{product.categories[0]}</p>
            <h1 className="mt-3 text-[1.95rem] md:text-[2.3rem]">{product.name}</h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="nums text-lg">{formatPrice(product.price)}</span>
              {product.compareAt ? (
                <span className="nums text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAt)}
                </span>
              ) : null}
              <span className="flex items-center gap-2 self-center text-xs text-muted-foreground">
                <StarRating rating={product.rating} />
                <span className="nums">{`${product.rating} · ${product.reviewCount} reviews`}</span>
              </span>

            </div>


            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-8">
              <p className="eyebrow mb-3">Colour — {color}</p>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    aria-label={c.name}
                    aria-pressed={color === c.name}
                    onClick={() => setColor(c.name)}
                    style={{ backgroundColor: c.hex }}
                    className={cn(
                      "h-8 w-8 rounded-full border border-border transition-all",
                      color === c.name && "ring-1 ring-foreground ring-offset-2 ring-offset-background",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="eyebrow">Size</p>
                <Dialog>
                  <DialogTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground link-underline">
                    <Ruler className="h-3.5 w-3.5" strokeWidth={1.4} /> Size guide
                  </DialogTrigger>
                  <DialogContent className="max-w-lg rounded-[10px] border-border">
                    <DialogTitle className="font-display text-2xl font-normal">
                      Size guide
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Body measurements in centimetres. If you are between sizes, we recommend
                      sizing down in oversized styles.
                    </p>
                    <table className="mt-4 w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          <th className="py-2 font-medium">Size</th>
                          <th className="py-2 font-medium">Chest</th>
                          <th className="py-2 font-medium">Waist</th>
                          <th className="py-2 font-medium">Hip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeGuide.map((row) => (
                          <tr key={row[0]} className="border-b border-border last:border-0">
                            {row.map((cell, i) => (
                              <td key={i} className="py-2.5">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-12 rounded-[8px] border border-border px-3.5 py-2.5 text-xs transition-colors hover:border-foreground",
                      size === s && "border-foreground bg-foreground text-background",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-[8px] border border-border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid h-12 w-11 place-items-center transition-colors hover:bg-secondary"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <span className="w-9 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(9, q + 1))}
                  className="grid h-12 w-11 place-items-center transition-colors hover:bg-secondary"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>

              <button
                type="button"
                disabled={!product.inStock || !selectedVariantInStock}
                onClick={() => {
                  if (!selectedVariant || selectedVariant.stockCount <= 0) {
                    toast("Selected variant is sold out", {
                      description: `${product.name} · ${size} · ${color}`,
                    });
                    return;
                  }
                  addToCart({ productId: product.id, size, color, quantity });
                  toast("Added to bag", { description: `${product.name} · ${size} · ${color}` });
                }}
                className="h-12 flex-1 rounded-[8px] bg-foreground px-8 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                {product.inStock && selectedVariantInStock ? "Add to bag" : "Sold out"}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={wishlisted}
                aria-label="Save to wishlist"
                className="grid h-12 w-12 place-items-center rounded-[8px] border border-border transition-colors hover:border-foreground"
              >
                <Heart className={cn("h-4 w-4", wishlisted && "fill-foreground")} strokeWidth={1.25} />
              </button>
            </div>

            <div className="mt-6 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5" strokeWidth={1.4} />
                Free delivery on orders over ₹1,499 — arrives in 3–5 working days
              </p>
              <p className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.4} />
                Free reverse pickup within 15 days, unworn with tags attached
              </p>
            </div>

            <Accordion type="single" collapsible className="mt-8 border-t border-border">
              <AccordionItem value="details">
                <AccordionTrigger className="text-xs uppercase tracking-[0.14em] hover:no-underline">
                  Details & fabric
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p className="mb-3">{product.fabric}</p>
                  <ul className="space-y-1.5">
                    {product.details.map((d) => (
                      <li key={d}>— {d}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="delivery">
                <AccordionTrigger className="text-xs uppercase tracking-[0.14em] hover:no-underline">
                  Delivery
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Standard delivery across India takes 3–5 working days (₹79, free over ₹1,499). Express
                  delivery is ₹199 and reaches most metros the next working day when ordered
                  before 13:00 IST. Cash on delivery is available under ₹5,000.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="text-xs uppercase tracking-[0.14em] hover:no-underline">
                  Returns
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Return anything unworn with tags attached within 15 days for a full refund.
                  Raise the return from your order history and we'll send a courier to your
                  address. Refunds are processed within five working days of arrival.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="text-xs uppercase tracking-[0.14em] hover:no-underline">
                  Care
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Wash less, wash cool. Air knitwear between wears and store folded rather than
                  hung. We repair stitching, buttons and zips free of charge for six months from purchase.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </article>

      {/* Reviews */}
      <section className="border-t border-border">
        <div className="container-editorial section-y">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Reviews</p>
              <h2 className="mt-3 text-3xl">{product.rating} out of 5</h2>
              <StarRating rating={product.rating} size={16} className="mt-3" />
              <p className="mt-3 text-sm text-muted-foreground">
                Based on {product.reviewCount} verified purchases
              </p>
              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((star, i) => {
                  const share = [72, 19, 6, 2, 1][i]!;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="w-3">{star}</span>
                      <span className="h-px flex-1 bg-border">
                        <span
                          className="block h-px bg-foreground"
                          style={{ width: `${share}%` }}
                        />
                      </span>
                      <span className="w-8 text-right">{share}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-10 lg:col-span-8">
              {globalReviews.map((review) => (
                <figure key={review.name} className="border-t border-border pt-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <blockquote className="mt-4">
                    <p className="font-display text-lg">{review.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {review.body}
                    </p>
                  </blockquote>
                  <figcaption className="mt-4 text-xs text-muted-foreground">
                    {review.name} — {review.location} · Verified purchase
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 ? (
        <section className="border-t border-border">
          <div className="container-editorial section-y">
            <h2 className="text-2xl md:text-3xl">You may also like</h2>
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.05}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Recently viewed */}
      {viewed.length > 0 ? (
        <section className="border-t border-border bg-secondary/50">
          <div className="container-editorial py-16">
            <h2 className="text-xl">Recently viewed</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
              {viewed.map((p) => (
                <ProductCard key={p!.id} product={p!} />
              ))}
            </div>
            <Link to="/shop" className="mt-10 inline-block text-xs uppercase tracking-[0.14em] link-underline">
              Continue shopping
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
