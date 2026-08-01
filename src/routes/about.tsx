import { createFileRoute, Link } from "@tanstack/react-router";
import editorial from "@/assets/editorial.jpg";
import seasonal from "@/assets/seasonal.jpg";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Atelier Nord" },
      { name: "description", content: "Atelier Nord is a Copenhagen clothing studio making limited runs from natural fibres in European mills and workshops." },
      { property: "og:title", content: "Our Story — Atelier Nord" },
      { property: "og:description", content: "A Copenhagen studio making limited runs from natural fibres in European workshops." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Since 2014"
        title="A studio, not a season machine"
        description="We release two collections a year and keep the pieces that work. Everything is made within Europe, in workshops we visit."
        crumbs={[{ label: "About" }]}
      />

      <section className="container-editorial section-y">
        <div className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <img
              src={editorial}
              alt="Model in tailored stone-coloured suiting"
              width={1600}
              height={912}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-[10px] object-cover"
            />
          </Reveal>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7">
            <h2 className="font-display text-3xl text-foreground">How we work</h2>
            <p>
              Atelier Nord began in a one-room studio in Nørrebro with a single wool coat and a
              conviction that most clothing is made too quickly. Twelve years later the method
              hasn't changed: we develop a pattern until it stops needing adjustment, then produce
              it in runs small enough that our makers can inspect every piece.
            </p>
            <p>
              Our wool comes from Biella, our linen from Kortrijk, our knitwear from a family mill
              in Hawick that has run the same gauge machines for forty years. We publish the name
              of every factory we work with, along with the wage floor we require.
            </p>
            <p>
              Nothing is designed to be replaced. We repair wool outerwear free of charge for two
              years, and we'll take back any Atelier Nord garment at the end of its life to be
              re-spun into insulation.
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
            { n: "42", label: "Styles in the permanent collection" },
            { n: "9", label: "European workshops we produce with" },
            { n: "2 yrs", label: "Free repairs on all wool outerwear" },
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
            alt="Model in a heavy oatmeal wool scarf and coat"
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
