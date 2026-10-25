import { createFileRoute, Link } from "@tanstack/react-router";
import { FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from "@/lib/shipping";
import { formatPrice } from "@/lib/shop-store";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — LOUIE HERITAGE" },
      {
        name: "description",
        content: "Delivery options, shipping estimates and our 15-day returns policy.",
      },
    ],
  }),
  component: ShippingReturnsPage,
});

function ShippingReturnsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Customer care"
        title="Shipping & returns"
        description="Clear delivery estimates and a straightforward 15-day return window."
        crumbs={[{ label: "Shipping & returns" }]}
      />
      <div className="container-editorial grid gap-12 py-12 md:grid-cols-2 md:py-16">
        <section>
          <h2 className="font-display text-2xl">Delivery across India</h2>
          <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              Standard delivery usually takes 3–5 working days. It costs{" "}
              {formatPrice(STANDARD_DELIVERY_FEE)} on orders up to{" "}
              {formatPrice(FREE_DELIVERY_THRESHOLD)} and is free on orders over{" "}
              {formatPrice(FREE_DELIVERY_THRESHOLD)}.
            </p>
            <p>
              Express delivery is ₹199 and is usually next working day in supported metro pin codes.
              Remote locations may take longer. Available options are shown at checkout.
            </p>
            <p>
              Orders are packed at our Meerut warehouse. We’ll send tracking details after dispatch.
            </p>
          </div>
        </section>
        <section>
          <h2 className="font-display text-2xl">Returns & refunds</h2>
          <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              You can request a return within 15 days of delivery. Items must be unworn, unwashed,
              and returned with their original tags attached.
            </p>
            <p>
              Request a return through your order history or contact our care team with your order
              number. Once approved, we’ll arrange a reverse pickup.
            </p>
            <p>
              Refunds are sent to the original payment method within five working days after the
              returned parcel reaches us.
            </p>
          </div>
          <Link to="/faq" className="mt-6 inline-block text-sm link-underline">
            Read frequently asked questions
          </Link>
        </section>
      </div>
    </>
  );
}
