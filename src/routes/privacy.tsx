import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — LOUIE HERITAGE" },
      { name: "description", content: "How LOUIE HERITAGE collects, uses and protects your personal data under India's Digital Personal Data Protection Act." },
      { property: "og:title", content: "Privacy Policy — LOUIE HERITAGE" },
      { property: "og:description", content: "How we collect, use and protect your personal data." },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "What we collect",
    body: "When you place an order we collect your name, delivery and billing address, email address, telephone number and payment confirmation. When you browse we collect anonymised analytics: pages viewed, device type and approximate region.",
  },
  {
    title: "Why we collect it",
    body: "To fulfil your order, provide customer care, prevent fraud, and — only where you have opted in — to send you collection previews. We do not sell personal data to third parties under any circumstances.",
  },
  {
    title: "Payment data",
    body: "Card details are handled entirely by our PCI-DSS compliant payment processor. LOUIE HERITAGE never sees or stores full card numbers.",
  },
  {
    title: "Cookies",
    body: "We use strictly necessary cookies to keep your bag and session working, and optional analytics cookies you can decline without losing functionality.",
  },
  {
    title: "Your rights",
    body: "Under India's Digital Personal Data Protection Act you may request a copy of your data, ask us to correct or erase it, object to processing, or withdraw consent at any time. Email privacy@louieheritage.in and we will respond within 30 days.",
  },
  {
    title: "Retention",
    body: "Order and invoice records are kept for eight years to meet GST and income tax requirements. Marketing preferences are kept until you unsubscribe. Analytics data is anonymised after 14 months.",
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="Last updated 1 June 2026. LOUIE HERITAGE, 12 Abu Lane, Sadar Bazar, Meerut 250001, is the data fiduciary."
        crumbs={[{ label: "Privacy" }]}
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
