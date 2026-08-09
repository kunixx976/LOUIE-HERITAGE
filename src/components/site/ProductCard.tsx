import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Eye } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/data";
import { formatPrice, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { QuickView } from "./QuickView";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { toggleWishlist, isWishlisted, addToCart } = useShop();
  const [quickView, setQuickView] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const discount = product.compareAt
    ? Math.round(100 - (product.price / product.compareAt) * 100)
    : 0;

  return (
    <article className="group relative">
      <div className="relative overflow-hidden rounded-[3px] bg-secondary">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          aria-label={product.name}
          className="block"
        >
          <div className="relative aspect-[4/5]">
            <img
              src={product.images[0]}
              alt={product.name}
              width={900}
              height={1200}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out group-hover:opacity-0"
            />
            <img
              src={product.images[1] ?? product.images[0]}
              alt=""
              aria-hidden="true"
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
          {discount > 0 ? (
            <span className="bg-foreground px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-background">
              −{discount}%
            </span>
          ) : null}
          {product.tags.includes("new") ? (
            <span className="border border-border bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]">
              New
            </span>
          ) : null}
          {!product.inStock ? (
            <span className="bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Sold out
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            toggleWishlist(product.id);
            toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist", {
              description: product.name,
            });
          }}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-background"
        >
          <Heart
            className={cn("h-4 w-4", wishlisted && "fill-foreground")}
            strokeWidth={1.25}
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          <button
            type="button"
            onClick={() => setQuickView(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-border bg-background/95 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] backdrop-blur transition-colors hover:bg-secondary"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.4} /> Quick view
          </button>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => {
              addToCart({
                productId: product.id,
                size: product.sizes[0]!,
                color: product.colors[0]!.name,
                quantity: 1,
              });
              toast("Added to bag", { description: `${product.name} · ${product.sizes[0]}` });
            }}
            className="flex-1 rounded-[8px] bg-foreground py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to bag
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex items-baseline justify-between gap-4">
        <h3 className="truncate font-sans text-sm font-normal">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="link-underline">
            {product.name}
          </Link>
        </h3>
        <div className="nums shrink-0 text-sm">
          {product.compareAt ? (
            <span className="mr-2 text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAt)}
            </span>
          ) : null}
          <span className={cn(product.compareAt && "text-sale")}>{formatPrice(product.price)}</span>
        </div>
      </div>
      <p className="mt-1 truncate text-xs text-muted-foreground">{product.fabric}</p>


      <QuickView product={product} open={quickView} onOpenChange={setQuickView} />
    </article>
  );
}
