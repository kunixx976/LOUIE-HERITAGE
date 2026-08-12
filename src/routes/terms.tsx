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
    body: "By placing an order with Mishra Clothings, Meerut (GSTIN 09ABCDE1234F1Z5) you accept these terms. They do not affect your statutory rights as a consumer under the Consumer Protection Act, 2019.",
  },
  {
    title: "2. Orders",
    body: "An order is an offer to buy. A contract is formed only when we send a dispatch confirmation. We may decline an order where a piece is unavailable, a pricing error has occurred, or payment authorisation fails.",
  },
  {
    title: "3. Pricing",
    body: "Prices are shown in Indian rupees and are inclusive of GST. We reserve the right to change prices for future orders.",
  },
  {
    title: "4. Delivery",
    body: "Estimated delivery times are indicative and not guaranteed. Risk passes to you on delivery. If a parcel arrives damaged, contact our care team within 48 hours with photographs and an unboxing video where possible.",
  },
  {
    title: "5. Returns and cancellation",
    body: "You may cancel an order any time before dispatch. Unworn items with tags attached can be returned within 15 days of delivery, with free reverse pickup across serviceable pin codes.",
  },
  {
    title: "6. Warranty",
    body: "All garments are guaranteed against manufacturing faults for six months. Normal wear, and alterations made by third parties, are not covered.",
  },
  {
    title: "7. Intellectual property",
    body: "All imagery, patterns, text and the MishraClothings name remain our property. They may not be reproduced commercially without written permission.",
  },
  {
    title: "8. Governing law",
    body: "These terms are governed by Indian law, and the courts of Meerut, Uttar Pradesh have exclusive jurisdiction over any dispute.",
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
