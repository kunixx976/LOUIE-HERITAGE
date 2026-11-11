import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — LOUIE HERITAGE" },
    { name: "description", content: "Contact LOUIE HERITAGE customer care by email, phone or WhatsApp." },
    { property: "og:title", content: "Contact — LOUIE HERITAGE" },
    { property: "og:description", content: "Contact LOUIE HERITAGE customer care by email, phone or WhatsApp." },
  ] }),
  component: ContactPage,
});

function ContactPage() {
  return <>
    <PageHeader eyebrow="Customer care" title="Contact" description="We're here to help with orders, sizing and product questions." crumbs={[{ label: "Contact" }]} />
    <div className="container-editorial grid gap-14 py-12 md:py-16 lg:grid-cols-12">
      <div className="space-y-8 text-sm lg:col-span-7">
        <div>
          <p className="eyebrow mb-2">Customer care</p>
          <a className="block text-muted-foreground link-underline" href="mailto:care@louieheritage.in">care@louieheritage.in</a>
          <a className="mt-1 block text-muted-foreground link-underline" href="tel:+919837044120">+91 98370 44120 · Call</a>
          <a className="mt-1 inline-block text-muted-foreground link-underline" href="https://wa.me/919837044120">WhatsApp customer care</a>
        </div>
        <div>
          <p className="eyebrow mb-2">Wholesale & bulk orders</p>
          <a className="text-muted-foreground link-underline" href="mailto:studio@louieheritage.in">studio@louieheritage.in</a>
        </div>
      </div>
      <aside className="space-y-8 text-sm lg:col-span-4 lg:col-start-9">
        <div><p className="eyebrow mb-2">Studio & showroom</p><p className="text-muted-foreground">12 Abu Lane, Sadar Bazar<br />Meerut 250001, Uttar Pradesh<br />Visits by appointment</p></div>
        <p className="text-xs leading-relaxed text-muted-foreground">These contact details are shown for customer support. Response times are not currently guaranteed.</p>
      </aside>
    </div>
  </>;
}
