import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/data";
import { PageHeader } from "@/components/site/PageHeader";
import { ShopBrowser } from "@/components/site/ShopBrowser";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — Atelier Nord" },
      {
        name: "description",
        content:
          "Browse the full Atelier Nord collection: wool coats, linen shirting, knitwear, leather footwear and accessories. Filter by size, colour and price.",
      },
      { property: "og:title", content: "Shop All — Atelier Nord" },
      {
        property: "og:description",
        content: "The full collection — wool coats, linen shirting, knitwear and accessories.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  return (
    <>
      <PageHeader
        eyebrow="Collection"
        title="Shop all"
        description="Every piece we currently make, produced in limited runs from natural fibres. Filter by size, colour, price or availability."
        crumbs={[{ label: "Shop" }]}
      />
      <ShopBrowser products={products} />
    </>
  );
}
