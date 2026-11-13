import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — LOUIE HERITAGE" },
      {
        name: "description",
        content: "Answers to common questions about sizing, repairs, payments and restocks.",
      },
      { property: "og:title", content: "FAQ — LOUIE HERITAGE" },
      { property: "og:description", content: "Sizing, repairs, payment and restock information." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Delivery options and charges are shown at checkout. Delivery estimates, service-area coverage and carrier tracking have not been verified or guaranteed.",
  },
  {
    q: "What is your returns policy?",
    a: "The seller's return, cancellation and refund terms are being confirmed. Do not send an item back without first receiving return instructions.",
  },
  {
    q: "How do your sizes run?",
    a: "Use the size guide and product details on each product page. Fit can vary by style; no general fit guarantee is currently published.",
  },
  {
    q: "Do you offer repairs?",
    a: "Repair and warranty terms have not been confirmed by the seller.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Once checkout is configured, pay online through Razorpay using UPI, Visa, Mastercard, RuPay or net banking, or choose cash on delivery. An order confirmation email is sent after the order is accepted.",
  },
  {
    q: "Where are your clothes made?",
    a: "Product origin, material and manufacturing details have not been independently verified. Confirm item-specific claims with the seller before purchase.",
  },
  {
    q: "Do you restock sold-out pieces?",
    a: "Restock dates are not currently published. Availability is shown on each product page.",
  },
];

function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Customer care"
        title="Frequently asked questions"
        description="Current information about sizing, delivery and orders."
        crumbs={[{ label: "FAQ" }]}
      />
      <div className="container-editorial py-12 md:py-16">
        <div className="mx-auto max-w-3xl divide-y divide-border border-y border-border">
          {faqs.map((item) => (
            <section key={item.q} className="py-6">
              <h2 className="font-display text-lg font-normal">{item.q}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
