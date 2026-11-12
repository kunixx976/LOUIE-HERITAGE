import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Eye } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/data";
import { formatPrice, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { showAddedToBagToast } from "@/lib/cart-toast";
import { QuickView } from "./QuickView";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted, addToCart } = useShop();
  const [quickView, setQuickView] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const needsOptions = product.sizes.length > 1 || product.colors.length > 1;
  const handleAddToBag = () => {
    if (needsOptions) {
      setQuickView(true);
      return;
    }
    const variant = product.variants.find((item) => item.stockCount > 0);
    if (!variant) return;
    addToCart({ productId: product.id, size: variant.size, color: variant.color, quantity: 1 });
    showAddedToBagToast(`${product.name} · ${variant.size}`, () => navigate({ to: "/cart" }));
  };
  const discount = product.compareAt
    ? Math.round(100 - (product.price / product.compareAt) * 100)
    : 0;

  return (
    <article className="group relative">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-secondary shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-shadow duration-500 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.09)]">
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
              className="absolute inset-0 h-full w-full object-cover"
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
          aria-label={
            wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-background md:right-3 md:top-3 md:h-9 md:w-9"
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-foreground")} strokeWidth={1.25} />
        </button>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 gap-2 opacity-0 transition-all duration-500 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 md:flex">
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
            onClick={handleAddToBag}
            className="flex-1 rounded-[8px] bg-foreground py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {needsOptions ? "Choose options" : "Add to bag"}
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex flex-col gap-x-4 gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="min-w-0 font-sans text-sm font-normal leading-snug sm:truncate">
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

      <div className="mt-3 flex gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setQuickView(true)}
          aria-label={`Quick view ${product.name}`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-border transition-colors active:bg-secondary"
        >
          <Eye className="h-4 w-4" strokeWidth={1.4} />
        </button>
        <button
          type="button"
          disabled={!product.inStock}
          onClick={handleAddToBag}
          className="h-11 flex-1 rounded-[8px] border border-foreground text-[11px] font-medium uppercase tracking-[0.14em] transition-colors active:bg-foreground active:text-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          {product.inStock ? (needsOptions ? "Choose options" : "Add to bag") : "Sold out"}
        </button>
      </div>

      <QuickView product={product} open={quickView} onOpenChange={setQuickView} />
    </article>
  );
}
