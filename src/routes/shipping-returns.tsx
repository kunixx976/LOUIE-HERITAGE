import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — LOUIE HERITAGE" },
      {
        name: "description",
        content: "Current delivery, return and warranty information for LOUIE HERITAGE orders.",
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
        description="Information about delivery, returns and refunds."
        crumbs={[{ label: "Shipping & returns" }]}
      />
      <div className="container-editorial grid gap-12 py-12 md:grid-cols-2 md:py-16">
        <section>
          <h2 className="font-display text-2xl">Delivery information</h2>
          <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              Delivery options and charges are displayed in checkout before an order is placed.
              Delivery estimates, service-area coverage and carrier tracking are not currently
              verified or guaranteed.
            </p>
            <p>
              Order status and carrier details will appear in order history when they are available.
            </p>
          </div>
        </section>
        <section>
          <h2 className="font-display text-2xl">Returns & refunds</h2>
          <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              Return, cancellation, refund and warranty terms have not yet been confirmed by the
              seller. Please do not send an item back without first receiving return instructions.
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
