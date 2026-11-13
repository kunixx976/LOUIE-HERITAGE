import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({ meta: [
    { title: "Shipping & Returns — LOUIE HERITAGE" },
    { name: "description", content: "Delivery charges, current return information and customer care contacts." },
  ] }),
  component: ShippingReturnsPage,
});

function ShippingReturnsPage() {
  return <>
    <PageHeader eyebrow="Customer care" title="Shipping & returns" description="Clear information before you place an order." crumbs={[{ label: "Shipping & returns" }]} />
    <div className="container-editorial grid gap-12 py-12 md:grid-cols-2 md:py-16">
      <section>
        <h2 className="font-display text-2xl">Delivery information</h2>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>Standard delivery costs ₹79, with free standard delivery on orders of ₹1,500 and above. Express delivery costs ₹199. The selected charge is included in the total before payment.</p>
          <p>Delivery estimates, service-area coverage and carrier tracking have not yet been confirmed. We will not display a promised delivery date until it is verified.</p>
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl">Returns & refunds</h2>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>Return, exchange, cancellation, refund and warranty terms have not yet been confirmed by the seller. Signed-in customers can submit a cancellation request before shipment or a return request after delivery from order history. Each request is reviewed manually; submitting one does not guarantee approval or issue a refund.</p>
          <p>Please contact customer care and wait for return instructions before sending an item back. Refunds, when approved, are processed separately and recorded by the store team.</p>
          <p>For an order issue, include your order number and a short description of the problem.</p>
        </div>
        <Link to="/contact" className="mt-6 inline-block text-sm link-underline">Contact customer care</Link><br />
        <Link to="/faq" className="mt-3 inline-block text-sm link-underline">Read frequently asked questions</Link>
      </section>
    </div>
  </>;
}
