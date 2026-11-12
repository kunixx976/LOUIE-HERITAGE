import { createFileRoute, Link } from "@tanstack/react-router";
import editorial from "@/assets/editorial.jpg";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LOUIE HERITAGE" },
      {
        name: "description",
        content: "Explore the LOUIE HERITAGE clothing and home-textile collection.",
      },
      { property: "og:title", content: "Our Story — LOUIE HERITAGE" },
      {
        property: "og:description",
        content: "Explore clothing and home textiles from LOUIE HERITAGE.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="The LOUIE HERITAGE collection"
        description="Explore clothing, accessories and home textiles."
        crumbs={[{ label: "About" }]}
      />

      <section className="container-editorial section-y">
        <div className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <img
              src={editorial}
              alt="Clothing and textiles"
              width={1600}
              height={912}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-[10px] object-cover object-[88%_center]"
            />
          </Reveal>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7">
            <h2 className="font-display text-3xl text-foreground">Browse the collection</h2>
            <p>
              Product pages list the available sizes, colours, materials and prices for each item.
              Review those details before adding a piece to your bag.
            </p>
            <p>
              Business, sourcing, warranty and service information will be updated when verified
              details are available.
            </p>
            <Link
              to="/shop"
              className="inline-block text-xs uppercase tracking-[0.14em] text-foreground link-underline"
            >
              Shop the collection
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
