import { useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { formatPrice, useShop } from "@/lib/shop-store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — LOUIE HERITAGE" },
      { name: "description", content: "Secure checkout with clear delivery costs and payment options." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const steps = ["Shipping", "Payment", "Confirmation"] as const;
const field =
  "h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground";
const FREE_DELIVERY_THRESHOLD = 1500;
const STANDARD_DELIVERY_FEE = 79;
const EXPRESS_DELIVERY_FEE = 199;
const paymentMethods = [
  {
    id: "razorpay",
    label: "Pay online",
    description: "UPI, Visa, Mastercard, RuPay or net banking",
  },
  {
    id: "cod",
    label: "Cash on delivery",
    description: "Pay when your order arrives",
  },
] as const;
type PaymentMethod = (typeof paymentMethods)[number]["id"];

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
type RazorpayInstance = { open: () => void; on: (event: string, callback: () => void) => void };
declare global {
  interface Window { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance }
}
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => window.Razorpay ? resolve() : reject(new Error("Secure checkout could not be loaded."));
    script.onerror = () => reject(new Error("Unable to load secure checkout. Please try again."));
    document.body.appendChild(script);
  });
}

function CheckoutPage() {
  const {
    cartProducts,
    subtotal,
    discount,
    couponCode,
    user,
    addresses,
    clearCart,
    catalogError,
  } = useShop();
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "", name: "", line1: "", city: "", postcode: "", country: "India",
    method: "standard", payment: "razorpay" as PaymentMethod,
  });
  const shipping = form.method === "express" ? EXPRESS_DELIVERY_FEE : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const total = Math.max(0, subtotal - discount) + shipping;
  const set = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  const checkoutPayload = () => ({
    email: user?.email || form.email,
    name: form.name,
    line1: form.line1,
    city: form.city,
    postcode: form.postcode,
    country: form.country,
    shippingMethod: form.method,
    couponCode: couponCode || undefined,
    items: cartProducts.map(({ line }) => ({
      productId: line.productId, size: line.size, color: line.color, quantity: line.quantity,
    })),
  });
  const finishOrder = (id: string) => {
    clearCart();
    setOrderId(id);
    setStep(2);
  };
  const submitOrder = async () => {
    const client = supabase;
    if (!client) {
      throw new Error("Checkout is temporarily unavailable. Please contact customer care.");
    }
    if (form.payment === "cod") {
      const { data, error: invokeError } = await client.functions.invoke("create-cod-order", {
        body: checkoutPayload(),
      });
      if (invokeError) throw new Error(invokeError.message || "Unable to place your order.");
      if (!data || typeof data.orderNumber !== "string") {
        throw new Error("The order could not be confirmed. Please try again.");
      }
      finishOrder(data.orderNumber);
      return;
    }

    const { data, error: invokeError } = await client.functions.invoke("create-razorpay-order", {
      body: checkoutPayload(),
    });
    if (invokeError) throw new Error(invokeError.message || "Unable to place your order.");
    if (!data || typeof data.orderNumber !== "string") throw new Error("The order could not be confirmed. Please contact customer care before trying again.");
    await loadRazorpay();
    if (!window.Razorpay) throw new Error("Secure checkout could not be opened.");
    const payment = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "LOUIE HERITAGE",
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      prefill: { name: form.name, email: user?.email || form.email },
      theme: { color: "#222222" },
      modal: { ondismiss: () => setBusy(false) },
      handler: async (response) => {
        try {
          const { data: verified, error: verifyError } = await client.functions.invoke("verify-razorpay-payment", {
            body: { ...response, orderNumber: data.orderNumber, abandonmentToken: data.abandonmentToken },
          });
          if (verifyError) throw new Error(verifyError.message || "Payment verification failed.");
          finishOrder(verified?.orderNumber || data.orderNumber);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Payment could not be verified. Please contact customer care.");
        } finally {
          setBusy(false);
        }
      },
    });
    payment.on("payment.failed", () => {
      setError("Online payment was not completed. Please try again.");
      setBusy(false);
    });
    payment.open();
  };
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (step < 1) { setStep(1); return; }
    setBusy(true);
    try { await submitOrder(); }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to place your order. Please try again.");
      setBusy(false);
    }
  };

  if (orderId) return (
    <div className="container-editorial flex min-h-[70vh] items-center justify-center py-20">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-border"><Check className="h-6 w-6" strokeWidth={1.25} /></div>
        <h1 className="mt-8 text-3xl">Thank you — your order is confirmed</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Order {orderId} has been received. Contact customer care if you need help with delivery or your order.</p>
        <Link to="/shop" className="mt-9 inline-block rounded-[8px] bg-foreground px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background">Continue shopping</Link>
      </div>
    </div>
  );
  if (cartProducts.length === 0) return (
    <div className="container-editorial flex min-h-[60vh] items-center justify-center py-20 text-center">
      <div><h1 className="text-3xl">Your bag is empty</h1><Link to="/shop" className="mt-8 inline-block rounded-[8px] bg-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.16em] text-background">Shop the collection</Link></div>
    </div>
  );

  return (
    <div className="container-editorial py-12 md:py-16">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="text-3xl md:text-4xl">Checkout</h1>
          <ol className="mt-8 flex items-center gap-6 border-b border-border pb-5 text-xs uppercase tracking-[0.14em]">
            {steps.map((label, index) => <li key={label} className={cn("flex items-center gap-2", index > step && "text-muted-foreground")}><span className={cn("grid h-6 w-6 place-items-center rounded-full border border-border text-[10px]", index <= step && "border-foreground bg-foreground text-background")}>{index + 1}</span>{label}</li>)}
          </ol>
          <form className="mt-9" onSubmit={onSubmit}>
            {catalogError && (
              <p role="status" className="mb-5 rounded-[8px] border border-border bg-surface p-4 text-sm text-muted-foreground">
                The live catalog could not be refreshed. Prices and availability will be rechecked
                before your order is placed.
              </p>
            )}
            {step === 0 ? <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{user ? <>Signed in as {user.email}.</> : <>Checking out as a guest. <Link to="/login" className="link-underline">Sign in</Link></>}</p>
              {addresses.length > 0 && <button type="button" onClick={() => { const address = addresses[0]!; setForm((current) => ({ ...current, name: address.name, line1: address.line1, city: address.city, postcode: address.postcode, country: address.country })); }} className="w-full rounded-[8px] border border-border p-4 text-left text-sm"><span className="eyebrow block">Use saved address — {addresses[0]!.label}</span><span className="mt-1 block text-muted-foreground">{addresses[0]!.line1}, {addresses[0]!.postcode} {addresses[0]!.city}</span></button>}
              <input required type="email" autoComplete="email" maxLength={254} readOnly={Boolean(user)} aria-label="Email address" placeholder="Email address" value={user?.email || form.email} onChange={set("email")} className={field} />
              <input required minLength={2} maxLength={100} autoComplete="name" aria-label="Full name" placeholder="Full name" value={form.name} onChange={set("name")} className={field} />
              <input required minLength={4} maxLength={200} autoComplete="street-address" aria-label="Street address" placeholder="Address" value={form.line1} onChange={set("line1")} className={field} />
              <div className="grid gap-4 sm:grid-cols-2">
                <input required minLength={2} maxLength={100} autoComplete="address-level2" aria-label="City" placeholder="City" value={form.city} onChange={set("city")} className={field} />
                <input required inputMode="numeric" autoComplete="postal-code" pattern="[1-9][0-9]{5}" title="Enter a valid 6-digit Indian PIN code" maxLength={6} aria-label="PIN code" placeholder="PIN code" value={form.postcode} onChange={set("postcode")} className={field} />
              </div>
              <input required minLength={2} maxLength={60} autoComplete="country-name" aria-label="Country" placeholder="Country" value={form.country} onChange={set("country")} className={field} />
              <div className="space-y-3 pt-4"><p className="eyebrow">Delivery method</p>
                {[
                  { id: "standard", label: "Standard delivery", price: subtotal >= FREE_DELIVERY_THRESHOLD ? "Free" : formatPrice(STANDARD_DELIVERY_FEE), estimate: "Delivery estimate is not currently confirmed" },
                  { id: "express", label: "Express delivery", price: formatPrice(EXPRESS_DELIVERY_FEE), estimate: "Delivery estimate is not currently confirmed" },
                ].map((method) => <label key={method.id} className={cn("flex cursor-pointer items-center justify-between rounded-[8px] border border-border p-4 text-sm", form.method === method.id && "border-foreground")}><span className="flex items-center gap-3"><input type="radio" name="method" checked={form.method === method.id} onChange={() => setForm((current) => ({ ...current, method: method.id }))} className="accent-black" /><span>{method.label}<span className="mt-1 block text-xs text-muted-foreground">{method.estimate}</span></span></span><span>{method.price}</span></label>)}
              </div>
            </div> : <div className="space-y-5 text-sm">
              <div className="rounded-[8px] border border-border p-5"><p className="eyebrow mb-2">Delivering to</p><p>{form.name} · {user?.email || form.email}</p><p className="text-muted-foreground">{form.line1}, {form.postcode} {form.city}, {form.country}</p><p className="mt-2 text-muted-foreground">{form.method === "express" ? "Express" : "Standard"} delivery · {shipping === 0 ? "Free" : formatPrice(shipping)}</p></div>
              <div className="space-y-3"><p className="eyebrow">Payment method</p>
                {paymentMethods.map((payment) => (
                  <label
                    key={payment.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-[8px] border border-border p-4",
                      form.payment === payment.id && "border-foreground",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={payment.id}
                      checked={form.payment === payment.id}
                      onChange={() =>
                        setForm((current) => ({ ...current, payment: payment.id }))
                      }
                      className="mt-1 accent-black"
                    />
                    <span>
                      <span className="block text-sm">{payment.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {payment.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">The total shown includes the selected delivery charge and any applied discount. The server confirms your final total before placing the order.</p>
            </div>}
            {step === 1 && !supabase && <p role="status" className="mt-5 rounded-[8px] border border-border bg-surface p-4 text-sm text-muted-foreground">Checkout is temporarily unavailable while the store connection is being completed. Please try again later.</p>}
            {error && <p role="alert" aria-live="assertive" className="mt-5 rounded-[8px] border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
            <div className="mt-9 flex items-center gap-3">{step > 0 && <button type="button" onClick={() => { setError(null); setStep(0); }} className="rounded-[8px] border border-border px-7 py-3.5 text-[11px] uppercase tracking-[0.16em]">Back</button>}<button type="submit" disabled={busy || (step === 1 && !supabase)} className="flex-1 rounded-[8px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background disabled:opacity-60">{busy ? "Processing…" : step === 1 ? form.payment === "cod" ? `Place COD order — ${formatPrice(total)}` : `Pay securely — ${formatPrice(total)}` : "Continue to payment"}</button></div>
          </form>
        </div>
        <aside className="lg:col-span-5"><div className="rounded-[10px] border border-border p-7 lg:sticky lg:top-28"><h2 className="text-xl">Your order</h2><ul className="mt-6 space-y-5">{cartProducts.map(({ line, product }) => <li key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-4"><img src={product.images[0]} alt="" width={900} height={1200} loading="lazy" className="h-24 rounded-[6px] object-cover" style={{ width: "4.5rem" }} /><div className="flex-1 text-sm"><p>{product.name}</p><p className="mt-1 text-xs text-muted-foreground">{line.color} · {line.size} · Qty {line.quantity}</p></div><span>{formatPrice(product.price * line.quantity)}</span></li>)}</ul><dl className="mt-7 space-y-3 border-t border-border pt-6 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>{discount > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd>−{formatPrice(discount)}</dd></div>}<div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div><div className="flex justify-between border-t border-border pt-4 text-base"><dt>Total</dt><dd>{formatPrice(total)}</dd></div></dl><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Standard shipping is ₹79, or free on orders of ₹1,500 and above. Express shipping is ₹199. Delivery timing is not yet confirmed.</p><Link to="/shipping-returns" className="mt-3 inline-block text-xs link-underline">Shipping, returns & support</Link></div></aside>
      </div>
    </div>
  );
}
