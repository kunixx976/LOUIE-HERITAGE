import { createFileRoute } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";
import { PageHeader } from "@/components/site/PageHeader";
import { ShopBrowser } from "@/components/site/ShopBrowser";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — LOUIE HERITAGE" },
      {
        name: "description",
        content:
          "Browse the full LOUIE HERITAGE range: cotton T-shirts, denim, sarees and ethnic wear, woollens, home textiles and accessories. Filter by size, colour and price.",
      },
      { property: "og:title", content: "Shop All — LOUIE HERITAGE" },
      {
        property: "og:description",
        content: "The full range — cotton tees, denim, sarees, woollens and home textiles.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { catalogProducts } = useShop();
  return (
    <>
      <PageHeader
        eyebrow="Collection"
        title="Shop all"
        description="Every piece we currently make, produced in limited runs from natural fibres. Filter by size, colour, price or availability."
        crumbs={[{ label: "Shop" }]}
      />
      <ShopBrowser products={catalogProducts} />
    </>
  );
}
