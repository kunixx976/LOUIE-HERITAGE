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
      <div className="relative overflow-hidden rounded-[10px] bg-secondary">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          aria-label={product.name}
          className="block"
        >
          <div className="relative aspect-[3/4]">
            <img
              src={product.images[0]}
              alt={product.name}
              width={900}
              height={1200}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:opacity-0"
            />
            <img
              src={product.images[1] ?? product.images[0]}
              alt=""
              aria-hidden="true"
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
          {discount > 0 ? (
            <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background shadow-sm">
              Sale {discount}%
            </span>
          ) : null}
          {product.tags.includes("new") ? (
            <span className="rounded-full bg-background px-3 py-1 text-[11px] font-medium text-foreground shadow-sm">
              New
            </span>
          ) : null}
          {!product.inStock ? (
            <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
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
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95"
        >
          <Heart
            className={cn("h-4 w-4 transition-colors", wishlisted && "fill-foreground text-foreground")}
            strokeWidth={1.5}
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          <button
            type="button"
            onClick={() => setQuickView(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-background/95 py-2.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-secondary"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> Quick view
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
            className="flex-1 rounded-full bg-foreground py-2.5 text-xs font-medium text-background shadow-sm transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to bag
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-sans text-sm font-medium tracking-tight">
            <Link to="/product/$slug" params={{ slug: product.slug }}>
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{product.fabric}</p>
        </div>
        <div className="shrink-0 text-right text-sm">
          <span>{formatPrice(product.price)}</span>
          {product.compareAt ? (
            <span className="ml-2 text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAt)}
            </span>
          ) : null}
        </div>
      </div>

      <QuickView product={product} open={quickView} onOpenChange={setQuickView} />
    </article>
  );
}
