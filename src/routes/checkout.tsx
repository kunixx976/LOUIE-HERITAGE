import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { formatPrice, useShop } from "@/lib/shop-store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — LOUIE HERITAGE" },
      {
        name: "description",
        content: "Four-step checkout: shipping, payment, review and order confirmation.",
      },
      { property: "og:title", content: "Checkout — LOUIE HERITAGE" },
      {
        property: "og:description",
        content: "Four-step guest checkout with shipping, payment, review and confirmation.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const steps = ["Shipping", "Payment", "Review", "Success"] as const;

const field =
  "h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground";

type PaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  handler: (response: PaymentResponse) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: () => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () =>
      window.Razorpay
        ? resolve()
        : reject(new Error("The secure payment window could not be loaded."));
    script.onerror = () =>
      reject(new Error("Unable to load secure payments. Check your connection and try again."));
    document.body.appendChild(script);
  });
}

function CheckoutPage() {
  const { cartProducts, subtotal, placeOrder, addresses } = useShop();
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    name: "",
    line1: "",
    city: "",
    postcode: "",
    country: "India",
    method: "standard",
    card: "",
    expiry: "",
    cvc: "",
  });

  const shipping =
    form.method === "express"
      ? 199
      : subtotal > FREE_DELIVERY_THRESHOLD
        ? 0
        : STANDARD_DELIVERY_FEE;
  const total = Math.max(0, subtotal - discount) + shipping;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  if (orderId) {
    return (
      <div className="container-editorial flex min-h-[70vh] items-center justify-center py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-border">
            <Check className="h-6 w-6" strokeWidth={1.25} />
          </div>
          <h1 className="mt-8 text-3xl">Thank you — your order is confirmed</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Order {orderId} is being packed at our Meerut warehouse. You'll receive tracking
            by email within 24 hours.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/orders"
              className="rounded-[8px] bg-foreground px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
            >
              View order
            </Link>
            <Link
              to="/shop"
              className="rounded-[8px] border border-border px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:border-foreground"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="container-editorial flex min-h-[60vh] items-center justify-center py-20 text-center">
        <div>
          <h1 className="text-3xl">Your bag is empty</h1>
          <Link
            to="/shop"
            className="mt-8 inline-block rounded-[8px] bg-foreground px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-editorial py-12 md:py-16">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="text-3xl md:text-4xl">Checkout</h1>

          <ol className="mt-8 flex items-center gap-6 border-b border-border pb-5 text-xs uppercase tracking-[0.14em]">
            {steps.map((label, i) => (
              <li
                key={label}
                className={cn("flex items-center gap-2", i > step && "text-muted-foreground")}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full border border-border text-[10px]",
                    i <= step && "border-foreground bg-foreground text-background",
                  )}
                >
                  {i + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>

          <form
            className="mt-9"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 2) setStep(step + 1);
              else setOrderId(placeOrder(total));
            }}
          >
            {step === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {user ? (
                    <>Signed in as {user.email}.</>
                  ) : (
                    <>
                      Checking out as a guest.{" "}
                      <Link to="/login" className="text-foreground link-underline">
                        Sign in
                      </Link>{" "}
                      to use a saved address.
                    </>
                  )}
                </p>
                {addresses.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const a = addresses[0]!;
                      setForm((f) => ({
                        ...f,
                        name: a.name,
                        line1: a.line1,
                        city: a.city,
                        postcode: a.postcode,
                        country: a.country,
                      }));
                    }}
                    className="w-full rounded-[8px] border border-border p-4 text-left text-sm transition-colors hover:border-foreground"
                  >
                    <span className="eyebrow block">Use saved address — {addresses[0]!.label}</span>
                    <span className="mt-1 block text-muted-foreground">
                      {addresses[0]!.line1}, {addresses[0]!.postcode} {addresses[0]!.city}
                    </span>
                  </button>
                ) : null}
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  readOnly={Boolean(user)}
                  aria-label="Email address"
                  placeholder="Email address"
                  value={user?.email || form.email}
                  onChange={set("email")}
                  className={field}
                />
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  aria-label="Full name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={set("name")}
                  className={field}
                />
                <input
                  required
                  minLength={4}
                  maxLength={200}
                  autoComplete="street-address"
                  aria-label="Street address"
                  placeholder="Address"
                  value={form.line1}
                  onChange={set("line1")}
                  className={field}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="address-level2"
                    aria-label="City"
                    placeholder="City"
                    value={form.city}
                    onChange={set("city")}
                    className={field}
                  />
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="postal-code"
                    pattern="[1-9][0-9]{5}"
                    title="Enter a valid 6-digit Indian PIN code"
                    maxLength={6}
                    aria-label="PIN code"
                    placeholder="PIN code"
                    value={form.postcode}
                    onChange={set("postcode")}
                    className={field}
                  />
                </div>
                <input
                  required
                  minLength={2}
                  maxLength={60}
                  autoComplete="country-name"
                  aria-label="Country"
                  placeholder="Country"
                  value={form.country}
                  onChange={set("country")}
                  className={field}
                />

                <div className="space-y-3 pt-4">
                  <p className="eyebrow">Delivery method</p>
                  {[
                    {
                      id: "standard",
                      label: "Standard delivery",
                      price:
                        subtotal > FREE_DELIVERY_THRESHOLD
                          ? "Free"
                          : formatPrice(STANDARD_DELIVERY_FEE),
                    },
                    { id: "express", label: "Express delivery", price: "₹199" },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-[8px] border border-border p-4 text-sm transition-colors",
                        form.method === m.id && "border-foreground",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="method"
                          checked={form.method === m.id}
                          onChange={() => setForm((f) => ({ ...f, method: m.id }))}
                          className="accent-black"
                        />
                        {m.label}
                      </span>
                      <span className="text-muted-foreground">{m.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <input required placeholder="Card number" value={form.card} onChange={set("card")} className={field} inputMode="numeric" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input required placeholder="MM / YY" value={form.expiry} onChange={set("expiry")} className={field} />
                  <input required placeholder="CVC" value={form.cvc} onChange={set("cvc")} className={field} inputMode="numeric" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Payments are encrypted and processed securely. We never store card details.
                </p>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6 text-sm">
                <div className="rounded-[8px] border border-border p-5">
                  <p className="eyebrow mb-2">Delivering to</p>
                  <p>{form.name}</p>
                  <p className="text-muted-foreground">
                    {form.line1}, {form.postcode} {form.city}, {form.country}
                  </p>
                </div>
                <div className="rounded-[8px] border border-border p-5">
                  <p className="eyebrow mb-2">Paying with</p>
                  <p className="text-muted-foreground">
                    Card ending {form.card.slice(-4) || "••••"} · {form.method === "express" ? "Express" : "Standard"} delivery
                  </p>
                </div>
              </div>
            ) : null}

            {error ? (
              <p
                role="alert"
                aria-live="assertive"
                className="mt-5 rounded-[8px] border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-9 flex items-center gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="rounded-[8px] border border-border px-7 py-3.5 text-[11px] uppercase tracking-[0.16em] transition-colors hover:border-foreground"
                >
                  Back
                </button>
              ) : null}
              <button
                type="submit"
                className="flex-1 rounded-[8px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
              >
                {step === 2 ? `Place order — ${formatPrice(total)}` : "Continue"}
              </button>
            </div>
          </form>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-[10px] border border-border p-7 lg:sticky lg:top-28">
            <h2 className="text-xl">Your order</h2>
            <ul className="mt-6 space-y-5">
              {cartProducts.map(({ line, product }) => (
                <li key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-4">
                  <img
                    src={product.images[0]}
                    alt=""
                    width={900}
                    height={1200}
                    loading="lazy"
                    className="h-24 w-18 rounded-[6px] object-cover"
                    style={{ width: "4.5rem" }}
                  />
                  <div className="flex-1 text-sm">
                    <p>{product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {line.color} · {line.size} · Qty {line.quantity}
                    </p>
                  </div>
                  <span className="text-sm">{formatPrice(product.price * line.quantity)}</span>
                </li>
              ))}
            </ul>
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
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-4 text-base">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Delivery charges are included in the total shown above.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
