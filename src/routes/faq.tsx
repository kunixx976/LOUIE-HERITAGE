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
    a: "Standard delivery across India takes 3–5 working days and is free on orders over ₹1,499 (otherwise ₹79). Express delivery is ₹199 and reaches most metros the next working day when ordered before 13:00 IST. Remote pin codes may take a day or two longer.",
  },
  {
    q: "What is your returns policy?",
    a: "Return anything unworn with its tags attached within 15 days. Raise a return from your order history and we'll arrange a free reverse pickup. Refunds are issued to the original payment method within five working days of the parcel reaching us.",
  },
  {
    q: "How do your sizes run?",
    a: "Our tees, shirts and denim run true to size. Styles described as oversized are deliberately generous — if you are between sizes or prefer a cleaner line, size down. Every product page includes a size guide with body measurements in centimetres.",
  },
  {
    q: "Do you offer repairs?",
    a: "Yes. We repair stitching, buttons and zips free of charge for six months from purchase. Send us a photograph on WhatsApp and we'll arrange a pickup from your address.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Once checkout has been configured for the store, you can pay with UPI or credit/debit card through Razorpay, or choose cash on delivery. An order confirmation email is sent after the order is accepted.",
  },
  {
    q: "Where are your clothes made?",
    a: "Everything is made in India. Our T-shirts and knitwear come from Tirupur in Tamil Nadu, denim from the mills of Ahmedabad and Bhilwara, sarees and ethnic wear from Surat, sweaters from Ludhiana, and home textiles from Panipat. Everything is checked and packed at our warehouse in Meerut.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "Orders can be amended within one hour of being placed, before they enter the packing queue. Email care@louieheritage.in or WhatsApp us on +91 98370 44120 with your order number and we'll do our best.",
  },
  {
    q: "Do you restock sold-out pieces?",
    a: "Core pieces are restocked two to three times a year. Add a piece to your wishlist and sign in — we'll email you when it returns.",
  },
];

function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Customer care"
        title="Frequently asked questions"
        description="Everything on sizing, delivery, returns and repairs. If your question isn't here, our care team replies within one working day."
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
