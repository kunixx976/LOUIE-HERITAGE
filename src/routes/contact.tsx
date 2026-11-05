import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — LOUIE HERITAGE" },
      { name: "description", content: "Customer-care contact information for LOUIE HERITAGE." },
      { property: "og:title", content: "Contact — LOUIE HERITAGE" },
      {
        property: "og:description",
        content: "Customer-care contact information for LOUIE HERITAGE.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Customer care"
        title="Contact"
        description="Customer-care contact details are being verified."
        crumbs={[{ label: "Contact" }]}
      />
      <div className="container-editorial py-12 md:py-16">
        <div className="max-w-2xl rounded-[10px] border border-border p-7">
          <h2 className="font-display text-2xl">Support channels are not available yet</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The phone number, email address and business address previously shown here have not been
            verified, so they have been removed. Please check back after the seller publishes
            confirmed contact details.
          </p>
        </div>
      </div>
    </>
  );
}
