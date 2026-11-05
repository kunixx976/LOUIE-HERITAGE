import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { featuredProducts } from "@/lib/data";
import { FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from "@/lib/shipping";
import { formatPrice, useShop } from "@/lib/shop-store";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Bag — LOUIE HERITAGE" },
      {
        name: "description",
        content: "Review the pieces in your LOUIE HERITAGE bag before checkout.",
      },
      { property: "og:title", content: "Shopping Bag — LOUIE HERITAGE" },
      { property: "og:description", content: "Review the pieces in your bag before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const {
    cartProducts,
    updateQuantity,
    removeLine,
    subtotal,
    discount,
    couponCode,
    applyCoupon,
    clearCoupon,
    hydrated,
  } = useShop();
  const [coupon, setCoupon] = useState("");
  const shipping =
    subtotal === 0 ? 0 : subtotal > FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const total = Math.max(0, subtotal - discount) + shipping;

  return (
    <>
      <PageHeader title="Shopping bag" crumbs={[{ label: "Bag" }]} />

      <div className="container-editorial py-12 md:py-16">
        {!hydrated ? null : cartProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-2xl">Your bag is empty</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Start with the pieces our customers return for most.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-block rounded-[8px] bg-foreground px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ul className="border-t border-border">
                {cartProducts.map(({ line, product }, index) => (
                  <li
                    key={`${line.productId}-${line.size}-${line.color}`}
                    className="flex gap-5 border-b border-border py-7"
                  >
                    <Link to="/product/$slug" params={{ slug: product.slug }} className="shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        width={900}
                        height={1200}
                        loading="lazy"
                        className="h-36 w-28 rounded-[8px] object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h2 className="text-sm font-medium">
                            <Link to="/product/$slug" params={{ slug: product.slug }}>
                              {product.name}
                            </Link>
                          </h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {line.color} · Size {line.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeLine(index)}
                          className="h-fit p-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="h-4 w-4" strokeWidth={1.4} />
                        </button>
                      </div>
                      <div className="mt-auto flex items-end justify-between">
                        <div className="flex items-center rounded-[8px] border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(index, line.quantity - 1)}
                            className="grid h-10 w-9 place-items-center transition-colors hover:bg-secondary"
                          >
                            <Minus className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                          <span className="w-7 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(index, line.quantity + 1)}
                            className="grid h-10 w-9 place-items-center transition-colors hover:bg-secondary"
                          >
                            <Plus className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                        </div>
                        <span className="text-sm">
                          {formatPrice(product.price * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-[10px] border border-border p-7 lg:sticky lg:top-28">
                <h2 className="text-xl">Order summary</h2>
                <p className="mt-3 rounded-[6px] bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                  Delivery charges are shown in your checkout total.
                </p>

                <form
                  className="mt-6 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (applyCoupon(coupon)) {
                      toast("Coupon applied", {
                        description: "10% off your order",
                        duration: 1800,
                      });
                    } else {
                      toast("That code isn't valid", {
                        description: "Try STUDIO10",
                        duration: 1800,
                      });
                    }
                  }}
                >
                  <label htmlFor="coupon" className="sr-only">
                    Coupon code
                  </label>
                  <input
                    id="coupon"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    className="h-11 flex-1 rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground"
                  />
                  <button
                    type="submit"
                    className="rounded-[8px] border border-border px-5 text-[11px] uppercase tracking-[0.14em] transition-colors hover:border-foreground"
                  >
                    Apply
                  </button>
                </form>
                {couponCode ? (
                  <p className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{couponCode} applied — 10% off</span>
                    <button type="button" onClick={clearCoupon} className="link-underline">
                      Remove
                    </button>
                  </p>
                ) : null}

                <dl className="mt-7 space-y-3 border-t border-border pt-6 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  {discount > 0 ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Discount</dt>
                      <dd>−{formatPrice(discount)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estimated shipping</dt>
                    <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-4 text-base">
                    <dt>Total</dt>
                    <dd>{formatPrice(total)}</dd>
                  </div>
                </dl>

                <p className="mt-3 text-xs text-muted-foreground">
                  Delivery charges and the final total are shown before you place your order.
                </p>

                <Link
                  to="/checkout"
                  className="mt-7 block rounded-[8px] bg-foreground py-4 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
                >
                  Proceed to checkout
                </Link>
                <Link
                  to="/shop"
                  className="mt-4 block text-center text-xs text-muted-foreground link-underline"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>

      <section className="border-t border-border">
        <div className="container-editorial py-16">
          <h2 className="text-2xl">Recommended for you</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {featuredProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
