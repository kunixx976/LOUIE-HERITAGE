import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — LOUIE HERITAGE" },
      {
        name: "description",
        content:
          "The terms governing purchases from LOUIE HERITAGE: orders, pricing, delivery, returns and warranty.",
      },
      { property: "og:title", content: "Terms & Conditions — LOUIE HERITAGE" },
      {
        property: "og:description",
        content: "Terms governing orders, pricing, delivery, returns and warranty.",
      },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "1. Seller details",
    body: "The seller's registered legal name, GSTIN and business address have not been verified for this storefront. Confirm the seller and tax-invoice details before making a purchase.",
  },
  {
    title: "2. Orders",
    body: "Checkout displays an order total before an order is submitted. An order confirmation is shown after the order service records the purchase or verifies online payment.",
  },
  {
    title: "3. Pricing",
    body: "Prices are shown in Indian rupees. The final amount shown at checkout includes the configured delivery charge and any applied discount. Tax treatment has not been verified.",
  },
  {
    title: "4. Delivery",
    body: "Delivery options and charges are shown at checkout. Delivery estimates, service-area coverage and carrier tracking have not been verified or guaranteed.",
  },
  {
    title: "5. Returns and cancellation",
    body: "The seller's cancellation, return and refund terms have not been confirmed. Do not send an item back without first receiving return instructions.",
  },
  {
    title: "6. Warranty",
    body: "Warranty and repair terms have not been confirmed by the seller.",
  },
  {
    title: "7. Intellectual property",
    body: "All imagery, patterns, text and the LOUIE HERITAGE name remain our property. They may not be reproduced commercially without written permission.",
  },
  {
    title: "8. Governing law",
    body: "Applicable governing-law and dispute-resolution details have not been verified for this storefront.",
  },
];

function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms & conditions"
        description="Seller, delivery, return and warranty details are being verified."
        crumbs={[{ label: "Terms" }]}
      />
      <div className="container-editorial py-12 md:py-16">
        <div className="max-w-2xl space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-xl">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
