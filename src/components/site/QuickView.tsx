import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getDefaultVariant, getProductVariant, type Product } from "@/lib/data";
import { formatPrice, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { showAddedToBagToast } from "@/lib/cart-toast";

export function QuickView({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { addToCart } = useShop();
  const defaultVariant = getDefaultVariant(product) ?? product.variants[0] ?? null;
  const [size, setSize] = useState(defaultVariant?.size ?? product.sizes[0]!);
  const [color, setColor] = useState(defaultVariant?.color ?? product.colors[0]!.name);
  const selectedVariant = getProductVariant(product, size, color);
  const selectedVariantInStock = Boolean(selectedVariant && selectedVariant.stockCount > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-[10px] border-border p-0 sm:max-w-3xl">
        <div className="grid md:grid-cols-2">
          <img
            src={product.images[0]}
            alt={product.name}
            width={900}
            height={1200}
            loading="lazy"
            className="h-full max-h-[70vh] w-full object-cover"
          />
          <div className="p-7 md:p-9">
            <DialogTitle className="font-display text-2xl font-normal">{product.name}</DialogTitle>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm">{formatPrice(product.price)}</span>
              {product.compareAt ? (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.compareAt)}
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-6">
              <p className="eyebrow mb-2">Colour — {color}</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    aria-label={c.name}
                    disabled={!product.variants.some((variant) => variant.color === c.name && variant.stockCount > 0)}
                    aria-pressed={color === c.name}
                    onClick={() => {
                      const firstAvailable = product.variants.find(
                        (variant) => variant.color === c.name && variant.stockCount > 0,
                      );
                      setColor(c.name);
                      if (firstAvailable) setSize(firstAvailable.size);
                    }}
                    style={{ backgroundColor: c.hex }}
                    className={cn(
                      "h-7 w-7 rounded-full border border-border transition-all disabled:cursor-not-allowed disabled:opacity-30",
                      color === c.name &&
                        "ring-1 ring-foreground ring-offset-2 ring-offset-background",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="eyebrow mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={!getProductVariant(product, s, color)?.stockCount}
                    aria-pressed={size === s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-11 rounded-[8px] border border-border px-3 py-2 text-xs transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through",
                      size === s && "border-foreground bg-foreground text-background",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
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
                addToCart({ productId: product.id, size, color, quantity: 1 });
                showAddedToBagToast(`${product.name} · ${size} · ${color}`, () =>
                  navigate({ to: "/cart" }),
                );
                onOpenChange(false);
              }}
              className="mt-8 w-full rounded-[8px] bg-foreground py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent disabled:opacity-40"
            >
              {product.inStock && selectedVariantInStock ? "Add to bag" : "Sold out"}
            </button>
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              onClick={() => onOpenChange(false)}
              className="mt-4 block text-center text-xs text-muted-foreground link-underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
