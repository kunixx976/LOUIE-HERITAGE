import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — MishraClothings" },
      { name: "description", content: "The terms governing purchases from MishraClothings: orders, pricing, delivery, returns and warranty." },
      { property: "og:title", content: "Terms & Conditions — MishraClothings" },
      { property: "og:description", content: "Terms governing orders, pricing, delivery, returns and warranty." },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "1. These terms",
    body: "By placing an order with Mishra Clothings (CVR 38 45 21 07) you accept these terms. They do not affect your statutory rights as a consumer under Danish and EU law.",
  },
  {
    title: "2. Orders",
    body: "An order is an offer to buy. A contract is formed only when we send a dispatch confirmation. We may decline an order where a piece is unavailable, a pricing error has occurred, or payment authorisation fails.",
  },
  {
    title: "3. Pricing",
    body: "Prices are shown in euro and include VAT at the applicable rate. Orders shipped outside the EU are sold DDP, with duties calculated at checkout. We reserve the right to change prices for future orders.",
  },
  {
    title: "4. Delivery",
    body: "Estimated delivery times are indicative and not guaranteed. Risk passes to you on delivery. If a parcel arrives damaged, contact our care team within seven days with photographs.",
  },
  {
    title: "5. Returns and cancellation",
    body: "You may cancel within 14 days of receipt under EU distance-selling rules; we extend this to 30 days for unworn items with tags attached. Return shipping is free within the EU using our prepaid label.",
  },
  {
    title: "6. Warranty",
    body: "All garments are guaranteed against manufacturing faults for two years. Wear consistent with normal use, and alterations made by third parties, are not covered.",
  },
  {
    title: "7. Intellectual property",
    body: "All imagery, patterns, text and the MishraClothings name remain our property. They may not be reproduced commercially without written permission.",
  },
  {
    title: "8. Governing law",
    body: "These terms are governed by Danish law. Disputes may be brought before the Danish Consumer Complaints Board or the EU Online Dispute Resolution platform.",
  },
];

function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms & conditions"
        description="Last updated 1 June 2026. Please read these terms before placing an order."
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
