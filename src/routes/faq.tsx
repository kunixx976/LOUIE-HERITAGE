import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ, Shipping & Returns — Atelier Nord" },
      { name: "description", content: "Answers on sizing, delivery times, returns, repairs and payment at Atelier Nord." },
      { property: "og:title", content: "FAQ, Shipping & Returns — Atelier Nord" },
      { property: "og:description", content: "Sizing, delivery, returns, repairs and payment." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery within the EU takes 2–4 working days and is free on orders over €150 (otherwise €6). Express delivery is €14 and arrives the next working day when ordered before 13:00 CET. Outside the EU we ship DDP, with duties and taxes included at checkout.",
  },
  {
    q: "What is your returns policy?",
    a: "Return anything unworn with its tags attached within 30 days. Print a prepaid label from your order history or ask our care team to arrange a collection. Refunds are issued to the original payment method within five working days of the parcel arriving with us.",
  },
  {
    q: "How do your sizes run?",
    a: "Our tailoring and shirting run true to size. Styles described as oversized are deliberately generous — if you are between sizes or prefer a cleaner line, size down. Every product page includes a size guide with body measurements in centimetres.",
  },
  {
    q: "Do you offer repairs?",
    a: "Yes. All wool outerwear is covered by free repairs for two years from purchase — buttons, seams, linings and moth damage included. Send us a photograph and we'll arrange collection.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Visa, Mastercard, American Express, PayPal, Apple Pay and Klarna. All payments are encrypted; we never store card details on our servers.",
  },
  {
    q: "Where are your clothes made?",
    a: "Everything is made within Europe: wool woven in Biella, linen in Kortrijk, knitwear in Hawick, and garments assembled in Portugal, Italy and Denmark. We publish our full supplier list annually.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "Orders can be amended within one hour of being placed, before they enter the packing queue. Email care@ateliernord.com with your order number and we'll do our best.",
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
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {faqs.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left font-display text-lg font-normal hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
