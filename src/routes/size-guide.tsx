import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { SizeGuideTable } from "@/components/site/SizeGuideTable";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size Guide — LOUIE HERITAGE" },
      {
        name: "description",
        content: "Body measurement charts for LOUIE HERITAGE apparel and denim.",
      },
    ],
  }),
  component: SizeGuidePage,
});

function SizeGuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Find your fit"
        title="Size guide"
        description="Use body measurements as a guide. Measure around the fullest part of your chest and hips, and around your natural waist."
        crumbs={[{ label: "Size guide" }]}
      />
      <div className="container-editorial grid gap-12 py-12 md:grid-cols-2 md:py-16">
        <section>
          <h2 className="font-display text-2xl">Tops & ethnic wear</h2>
          <p className="mb-5 mt-2 text-sm text-muted-foreground">
            Body measurements in centimetres. Choose the larger size if you fall between sizes.
          </p>
          <SizeGuideTable kind="apparel" />
        </section>
        <section>
          <h2 className="font-display text-2xl">Denim</h2>
          <p className="mb-5 mt-2 text-sm text-muted-foreground">
            Denim sizes are waist measurements in inches. The waist and hip ranges below are body
            measurements in centimetres.
          </p>
          <SizeGuideTable kind="denim" />
        </section>
      </div>
    </>
  );
}
