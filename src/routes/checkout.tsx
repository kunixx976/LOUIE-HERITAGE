import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from "@/lib/shipping";
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
  const { cartProducts, subtotal, discount, placeOrder, refreshOrders, addresses, hydrated, user } =
    useShop();
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    line1: "",
    city: "",
    postcode: "",
    country: "India",
    method: "standard",
    paymentMethod: "razorpay" as "razorpay" | "cod",
  });

  useEffect(() => {
    if (!hydrated || !user) return;
    setForm((current) => ({
      ...current,
      email: current.email || user.email,
      name: current.name || user.name,
    }));
  }, [hydrated, user]);

  const shipping =
    form.method === "express"
      ? 199
      : subtotal > FREE_DELIVERY_THRESHOLD
        ? 0
        : STANDARD_DELIVERY_FEE;
  const total = Math.max(0, subtotal - discount) + shipping;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submitOrder() {
    setError("");
    setSubmitting(true);
    try {
      if (!supabase) {
        throw new Error("Checkout is not configured. Please try again later.");
      }
      const client = supabase;

      const checkout = {
        email: user?.email.trim() || form.email.trim(),
        name: form.name.trim(),
        line1: form.line1.trim(),
        city: form.city.trim(),
        postcode: form.postcode.trim(),
        country: form.country.trim(),
        shippingMethod: form.method,
        couponCode: discount > 0 ? "STUDIO10" : undefined,
        items: cartProducts.map(({ line, product }) => ({
          productId: product.id,
          size: line.size,
          color: line.color,
          quantity: line.quantity,
        })),
      };

      if (form.paymentMethod === "cod") {
        const { data, error: functionError } = await client.functions.invoke<{
          orderNumber: string;
          emailSent: boolean;
          error?: string;
        }>("create-cod-order", { body: checkout });
        if (functionError) throw new Error(data?.error ?? functionError.message);
        if (!data?.orderNumber) throw new Error(data?.error ?? "Unable to place your order.");
        setEmailSent(data.emailSent);
        setOrderId(placeOrder(data.orderNumber));
        void refreshOrders();
        setStep(3);
        return;
      }

      const { data: paymentOrder, error: createError } = await client.functions.invoke<{
        orderNumber: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
        abandonmentToken: string;
        error?: string;
      }>("create-razorpay-order", { body: checkout });
      if (createError) throw new Error(paymentOrder?.error ?? createError.message);
      if (!paymentOrder?.razorpayOrderId || !paymentOrder.keyId || !paymentOrder.abandonmentToken) {
        throw new Error(paymentOrder?.error ?? "Unable to start payment. Please try again.");
      }

      await loadRazorpay();
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const fail = (message: string) => {
          if (settled) return;
          settled = true;
          reject(new Error(message));
        };
        const markAbandoned = async (reason: string) => {
          if (settled) return;
          try {
            const { data: abandoned, error: abandonError } = await client.functions.invoke<{
              abandoned: boolean;
            }>("abandon-razorpay-order", {
              body: {
                razorpayOrderId: paymentOrder.razorpayOrderId,
                abandonmentToken: paymentOrder.abandonmentToken,
              },
            });
            if (abandonError) throw abandonError;
            if (!abandoned?.abandoned) {
              throw new Error("The payment may already have completed. Check your order history.");
            }
            fail(reason);
          } catch (cause) {
            console.error("Unable to record the cancelled payment.", cause);
            fail(
              cause instanceof Error
                ? `${cause.message} Check order history before trying again.`
                : "We couldn't update the payment status. Check order history before trying again.",
            );
          }
        };
        const Razorpay = window.Razorpay;
        if (!Razorpay) {
          fail("The secure payment window could not be loaded.");
          return;
        }
        const instance = new Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: "LOUIE HERITAGE",
          description: `Order ${paymentOrder.orderNumber}`,
          order_id: paymentOrder.razorpayOrderId,
          prefill: { name: form.name, email: checkout.email },
          theme: { color: "#111111" },
          modal: {
            ondismiss: () =>
              void markAbandoned("Payment window closed. Your order has not been confirmed."),
          },
          handler: (response) => {
            void (async () => {
              const { data, error: verifyError } = await client.functions.invoke<{
                orderNumber: string;
                emailSent: boolean;
                error?: string;
              }>("verify-razorpay-payment", { body: response });
              if (verifyError || !data?.orderNumber) {
                fail(
                  data?.error ??
                    verifyError?.message ??
                    "We couldn't verify your payment. If you were charged, check order history before trying again.",
                );
                return;
              }
              if (settled) return;
              settled = true;
              setEmailSent(data.emailSent);
              setOrderId(placeOrder(data.orderNumber));
              void refreshOrders();
              setStep(3);
              resolve();
            })().catch((cause: unknown) => {
              fail(cause instanceof Error ? cause.message : "We couldn't verify your payment.");
            });
          },
        });
        instance.on("payment.failed", () => {
          void markAbandoned("Payment failed. You can try again or choose cash on delivery.");
        });
        instance.open();
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to complete checkout. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="container-editorial flex min-h-[60vh] items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading your bag…</p>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="container-editorial min-h-[70vh] py-16 md:py-20">
        <ol
          aria-label="Checkout progress"
          className="mx-auto flex max-w-3xl items-center justify-between gap-2 border-b border-border pb-5 text-[10px] uppercase tracking-[0.1em] sm:text-xs sm:tracking-[0.14em]"
        >
          {steps.map((label) => (
            <li key={label} className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-foreground bg-foreground text-background">
                <Check className="h-3.5 w-3.5" />
              </span>
              {label}
            </li>
          ))}
        </ol>
        <div className="mx-auto mt-16 max-w-md text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-border">
            <Check className="h-6 w-6" strokeWidth={1.25} />
          </div>
          <h1 className="mt-8 text-3xl">Your order is confirmed</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Order {orderId} is confirmed
            {form.paymentMethod === "cod"
              ? " with cash due on delivery"
              : " and your payment was verified"}
            .
            {emailSent
              ? ` A confirmation email was sent to ${form.email}.`
              : " We couldn't send a confirmation email. Your order is saved; use Track an order to check its status."}
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
              if (step < 2) {
                setError("");
                setStep(step + 1);
              } else void submitOrder();
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
              <div className="rounded-[8px] border border-border p-5">
                <p className="eyebrow">Payment method</p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      id: "razorpay" as const,
                      title: "Pay online",
                      detail: "UPI or credit/debit card via Razorpay",
                    },
                    {
                      id: "cod" as const,
                      title: "Cash on delivery",
                      detail: "Pay when your order arrives",
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-[8px] border border-border p-4 transition-colors",
                        form.paymentMethod === option.id && "border-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={form.paymentMethod === option.id}
                        onChange={() =>
                          setForm((current) => ({ ...current, paymentMethod: option.id }))
                        }
                        className="mt-1 accent-black"
                      />
                      <span>
                        <span className="block text-sm">{option.title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {option.detail}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
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
                  <p className="eyebrow mb-2">Payment & delivery</p>
                  <p>
                    {form.paymentMethod === "cod"
                      ? "Cash on delivery"
                      : "UPI or credit/debit card — processed securely by Razorpay"}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    {form.method === "express"
                      ? "Express delivery — ₹199"
                      : `Standard delivery — ${
                          shipping === 0 ? "Free" : formatPrice(STANDARD_DELIVERY_FEE)
                        }`}
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
                disabled={submitting}
                className="flex-1 rounded-[8px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent disabled:cursor-wait disabled:opacity-60"
              >
                {submitting
                  ? "Processing…"
                  : step === 2
                    ? form.paymentMethod === "cod"
                      ? `Place COD order — ${formatPrice(total)}`
                      : `Pay securely — ${formatPrice(total)}`
                    : "Continue"}
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
