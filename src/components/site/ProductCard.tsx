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

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 ? (
            <span className="rounded-[2px] bg-foreground px-2 py-1 text-[10px] font-medium uppercase leading-none tracking-[0.12em] text-background">
              −{discount}%
            </span>
          ) : null}
          {product.tags.includes("new") ? (
            <span className="rounded-[2px] bg-background/90 px-2 py-1 text-[10px] font-medium uppercase leading-none tracking-[0.12em] backdrop-blur">
              New
            </span>
          ) : null}
          {!product.inStock ? (
            <span className="rounded-[2px] bg-background/90 px-2 py-1 text-[10px] font-medium uppercase leading-none tracking-[0.12em] text-muted-foreground backdrop-blur">
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
          className={cn(
            "absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-foreground transition-all duration-300",
            "opacity-0 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100",
            wishlisted && "opacity-100",
          )}
        >
          <Heart
            className={cn("h-4 w-4 drop-shadow-sm", wishlisted && "fill-foreground")}
            strokeWidth={1.25}
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full p-3 transition-transform duration-500 ease-out group-hover:translate-y-0 md:block">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setQuickView(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[3px] bg-background/95 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] backdrop-blur transition-colors hover:bg-background"
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
              className="flex-1 rounded-[3px] bg-foreground py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to bag
            </button>
          </div>
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
