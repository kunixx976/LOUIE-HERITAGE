import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import editorial from "@/assets/editorial.jpg";
import {
  categories,
  featuredProducts,
  newArrivals,
  summerProducts,
  winterProducts,
} from "@/lib/data";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { WornByBarrelGallery } from "@/components/site/WornByBarrelGallery";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LOUIE HERITAGE — Everyday Cotton, Denim & Ethnic Wear" },
      {
        name: "description",
        content: "Explore cotton, denim, ethnic wear and home textiles from LOUIE HERITAGE.",
      },
      { property: "og:title", content: "LOUIE HERITAGE — Everyday Cotton, Denim & Ethnic Wear" },
      {
        property: "og:description",
        content: "Explore clothing, accessories and home textiles from LOUIE HERITAGE.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
          <img
            src={hero}
            alt="Two models in relaxed cotton shirting and straight-fit denim"
            width={1920}
            height={1088}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="container-editorial relative flex h-full items-end pb-16 md:pb-24">
            <div className="max-w-2xl text-white animate-fade-up">
              <p className="eyebrow text-white/80">New Season 2026</p>
              <h1 className="mt-5 text-[2.75rem] leading-[1.06] md:text-6xl lg:text-7xl">
                Everyday clothing,
                <br />
                thoughtfully selected
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/90">
                Explore clothing, accessories and home textiles for everyday wear.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/category/$slug"
                  params={{ slug: "women" }}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-black transition-colors hover:bg-white/90"
                >
                  Shop women
                </Link>
                <Link
                  to="/category/$slug"
                  params={{ slug: "men" }}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-8 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  Shop men
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="border-y border-border bg-secondary/50">
        <div className="container-editorial section-y">
          <SectionHeading
            eyebrow="Browse"
            title="Featured categories"
            description="Explore clothing, accessories and home textiles."
          />
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((category, i) => (
              <Reveal key={category.slug} delay={(i % 5) * 0.05}>
                <Link to="/category/$slug" params={{ slug: category.slug }} className="group block">
                  <div className="overflow-hidden rounded-[10px] bg-background">
                    <img
                      src={category.image}
                      alt={category.name}
                      width={900}
                      height={1200}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-3 text-sm">{category.name}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-editorial section-y">
        <SectionHeading
          eyebrow="Selected pieces"
          title="Featured products"
          description="A selection from the current collection."
          action={
            <Link
              to="/shop"
              className="text-sm font-medium transition-colors hover:text-muted-foreground"
            >
              View all
            </Link>
          }
        />
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {featuredProducts.slice(0, 4).map((product, i) => (
            <Reveal key={product.id} delay={i * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Editorial banner */}
      <section className="relative">
        <div className="relative h-[70vh] min-h-[460px] w-full overflow-hidden">
          <img
            src={editorial}
            alt="Model in a cotton shirt and straight-fit denim in daylight"
            width={1600}
            height={912}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
          <div className="container-editorial relative flex h-full items-center">
            <Reveal className="max-w-lg text-white">
              <p className="eyebrow text-white/70">The collection</p>
              <h2 className="mt-4 text-3xl leading-[1.15] md:text-5xl">Pieces for everyday</h2>
              <p className="mt-5 text-sm leading-relaxed text-white/80">
                Explore clothing and textiles across the LOUIE HERITAGE collection.
              </p>
              <Link
                to="/about"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-8 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Read the story
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-editorial section-y">
        <SectionHeading
          eyebrow="Just landed"
          title="New arrivals"
          action={
            <Link
              to="/shop"
              className="text-sm font-medium transition-colors hover:text-muted-foreground"
            >
              View all
            </Link>
          }
        />
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {newArrivals.slice(0, 4).map((product, i) => (
            <Reveal key={product.id} delay={i * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Seasonal collection */}
      <section className="border-y border-border bg-secondary/50">
        <div className="container-editorial section-y">
          <div className="grid items-center gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <p className="eyebrow">Winter edit</p>
              <h2 className="mt-4 text-3xl leading-[1.15] md:text-[2.6rem]">Layered knits</h2>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Fine-gauge knits and easy layers, made for the cooler months and simple to wear
                every day.
              </p>
              <Link
                to="/category/$slug"
                params={{ slug: "winter" }}
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Shop winter
              </Link>
            </Reveal>
            <div className="grid grid-cols-2 gap-5 md:col-span-8 lg:grid-cols-3">
              {winterProducts.slice(0, 3).map((product, i) => (
                <Reveal key={product.id} delay={i * 0.06}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Summer collection */}
      <section className="container-editorial section-y">
        <SectionHeading
          eyebrow="Light layers"
          title="The summer edit"
          description="Airy cotton, relaxed shapes and easy pieces for warmer days."
          action={
            <Link
              to="/category/$slug"
              params={{ slug: "summer" }}
              className="text-sm font-medium transition-colors hover:text-muted-foreground"
            >
              Shop summer
            </Link>
          }
        />
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {summerProducts.slice(0, 4).map((product, i) => (
            <Reveal key={product.id} delay={i * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Worn by you */}
      <section className="overflow-hidden border-t border-border bg-secondary/35">
        <div className="container-editorial section-y">
          <SectionHeading
            eyebrow="Community"
            title="Worn by you"
            description="Real looks, worn your way. Explore the LOUIE HERITAGE community on Instagram."
            align="center"
            action={
              <a
                href="https://www.instagram.com/louieheritage"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium transition-colors hover:text-muted-foreground"
              >
                Follow along
              </a>
            }
          />
          <div className="mt-10 md:mt-14">
            <WornByBarrelGallery />
          </div>
        </div>
      </section>
    </>
  );
}
