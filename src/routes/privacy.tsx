import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — LOUIE HERITAGE" },
      {
        name: "description",
        content: "How order and account data is handled on the LOUIE HERITAGE storefront.",
      },
      { property: "og:title", content: "Privacy Policy — LOUIE HERITAGE" },
      {
        property: "og:description",
        content: "How we collect, use and protect your personal data.",
      },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "What we collect",
    body: "When you place an order, the store processes your name, email address, delivery address, cart items, order amounts and payment status. Sign-in is provided by Supabase. The storefront does not request a telephone number or store card numbers.",
  },
  {
    title: "Why we collect it",
    body: "Order and account information is used to create and manage orders, process payment status and show order history. Marketing and analytics integrations are not currently active.",
  },
  {
    title: "Payment data",
    body: "Razorpay processes online payments. The order service stores payment references and status, not card numbers.",
  },
  {
    title: "Cookies",
    body: "Essential browser storage keeps your bag and sign-in working. Optional analytics are not currently active on this site. You can choose whether to allow optional analytics using Cookie preferences; your choice is saved in this browser and can be changed at any time.",
  },
  {
    title: "Your rights",
    body: "The privacy contact channel and request-handling process have not been verified. Confirmed contact details will be published here when available.",
  },
  {
    title: "Retention",
    body: "The retention periods for account and order data have not been confirmed. No analytics retention period is claimed because analytics are not currently active.",
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="How order and account data is handled on the LOUIE HERITAGE storefront."
        crumbs={[{ label: "Privacy" }]}
      />
      <div className="container-editorial py-12 md:py-16">
        <div className="max-w-2xl space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-xl">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              {s.title === "Cookies" ? (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("louie:open-cookie-settings"))}
                  className="mt-4 text-xs uppercase tracking-[0.14em] link-underline"
                >
                  Open cookie preferences
                </button>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
