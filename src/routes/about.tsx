import { createFileRoute, Link } from "@tanstack/react-router";
import editorial from "@/assets/editorial.jpg";
import seasonal from "@/assets/seasonal.jpg";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — MishraClothings" },
      { name: "description", content: "MishraClothings is a Meerut-based clothing business sourcing cotton, denim, ethnic wear and home textiles directly from India's textile hubs." },
      { property: "og:title", content: "Our Story — MishraClothings" },
      { property: "og:description", content: "A family business in Meerut, buying directly from Indian mills and knitting units." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="A family business"
        title="Bought from the source, sold without the mark-up"
        description="We travel to the mills and knitting units ourselves, buy in small lots, and ship from our own warehouse in Meerut."
        crumbs={[{ label: "About" }]}
      />

      <section className="container-editorial section-y">
        <div className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <img
              src={editorial}
              alt="Cotton shirting and denim from our current range"
              width={1600}
              height={912}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-[10px] object-cover"
            />
          </Reveal>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7">
            <h2 className="font-display text-3xl text-foreground">How we work</h2>
            <p>
              MishraClothings started as a single counter on Abu Lane in Sadar Bazar, Meerut,
              selling cotton basics to families who came back every season. The method hasn't
              changed since: buy directly from the people who make the cloth, keep the range small,
              and price it honestly.
            </p>
            <p>
              Our T-shirts and knitwear come from Tirupur, denim from the mills of Ahmedabad and
              Bhilwara, sarees and ethnic wear from Surat, sweaters from Ludhiana, and bedsheets
              and throws from Panipat. Every lot is checked, folded and dispatched from our own
              warehouse in Meerut.
            </p>
            <p>
              No showroom mark-up and no middlemen — that difference stays in the price. If
              stitching, a button or a zip gives way within six months, we repair or replace it.
            </p>
            <Link to="/shop" className="inline-block text-xs uppercase tracking-[0.14em] text-foreground link-underline">
              Shop the collection
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50">
        <div className="container-editorial section-y grid gap-10 md:grid-cols-3">
          {[
            { n: "6", label: "Textile hubs we buy from directly" },
            { n: "12k+", label: "Orders shipped across India" },
            { n: "6 mths", label: "Free repairs on stitching, buttons and zips" },
          ].map((stat) => (

            <Reveal key={stat.label}>
              <p className="font-display text-5xl">{stat.n}</p>
              <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative">
        <div className="relative h-[60vh] min-h-[380px] overflow-hidden">
          <img
            src={seasonal}
            alt="Ludhiana wool-blend knitwear from the winter edit"
            width={1600}
            height={912}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </section>
    </>
  );
}
