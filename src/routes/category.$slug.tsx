import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCategory, productsInCategory } from "@/lib/data";
import { Breadcrumbs } from "@/components/site/PageHeader";
import { ShopBrowser } from "@/components/site/ShopBrowser";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Category unavailable — Atelier Nord" }, { name: "robots", content: "noindex" }],
      };
    }
    const { category } = loaderData;
    const title = `${category.name} — Atelier Nord`;
    return {
      meta: [
        { title },
        { name: "description", content: category.description },
        { property: "og:title", content: title },
        { property: "og:description", content: category.description },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const items = productsInCategory(category.slug);

  return (
    <>
      <header className="relative border-b border-border">
        <div className="relative h-[46vh] min-h-[320px] overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            width={900}
            height={1200}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="container-editorial relative flex h-full flex-col justify-end pb-12 text-white">
            <h1 className="text-4xl leading-[1.1] md:text-6xl">{category.name}</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
              {category.description}
            </p>
          </div>
        </div>
        <div className="container-editorial py-5">
          <Breadcrumbs items={[{ label: "Shop", to: "/shop" }, { label: category.name }]} />
        </div>
      </header>
      <ShopBrowser products={items} lockedCategory={category.slug} />
    </>
  );
}
