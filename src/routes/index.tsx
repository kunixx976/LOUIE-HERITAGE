import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import editorial from "@/assets/editorial.jpg";
import { bestSellers, categories, galleryImages, newArrivals, reviews, seasonal } from "@/lib/data";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { StarRating } from "@/components/site/StarRating";
import { NewsletterForm } from "@/components/site/NewsletterForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier Nord — Considered Clothing, Made in Europe" },
      {
        name: "description",
        content:
          "Wool coats, linen shirting and quiet tailoring in limited runs. Designed in Copenhagen, made in Europe. Free shipping over €150.",
      },
      { property: "og:title", content: "Atelier Nord — Considered Clothing, Made in Europe" },
      {
        property: "og:description",
        content:
          "Wool coats, linen shirting and quiet tailoring in limited runs. Designed in Copenhagen, made in Europe.",
      },
    ],
  }),
  component: Home,
});

const promos = [
  { title: "Shop Women", slug: "women", copy: "Fluid tailoring & knitwear" },
  { title: "Shop Men", slug: "men", copy: "Softly structured staples" },
  { title: "New Collection", slug: "winter", copy: "Autumn / Winter 26" },
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
          <img
            src={hero}
            alt="Two models in double-breasted wool coats inside a minimal concrete gallery"
            width={1920}
            height={1088}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="container-editorial relative flex h-full items-end pb-16 md:pb-24">
            <div className="max-w-2xl text-white animate-fade-up">
              <p className="eyebrow text-white/70">Autumn / Winter 2026</p>
              <h1 className="mt-5 text-[2.75rem] leading-[1.06] md:text-6xl lg:text-7xl">
                Clothes that outlast
                <br />
                the season they arrive in
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80">
                Double-faced wool, washed linen and lambswool knits, cut in limited runs by
                makers we've worked with for a decade.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/category/$slug"
                  params={{ slug: "women" }}
                  className="rounded-[8px] bg-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-black transition-colors hover:bg-white/85"
                >
                  Shop women
                </Link>
                <Link
                  to="/category/$slug"
                  params={{ slug: "men" }}
                  className="rounded-[8px] border border-white/60 px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/10"
                >
                  Shop men
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo triptych */}
      <section className="container-editorial section-y">
        <div className="grid gap-5 md:grid-cols-3">
          {promos.map((promo, i) => {
            const category = categories.find((c) => c.slug === promo.slug)!;
            return (
              <Reveal key={promo.slug} delay={i * 0.08}>
                <Link
                  to="/category/$slug"
                  params={{ slug: promo.slug }}
                  className="group block overflow-hidden rounded-[10px]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                    <img
                      src={category.image}
                      alt={category.name}
                      width={900}
                      height={1200}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex items-end justify-between pt-5">
                    <div>
                      <h2 className="text-xl">{promo.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{promo.copy}</p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1"
                      strokeWidth={1.25}
                    />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Featured categories */}
      <section className="border-y border-border bg-secondary/50">
        <div className="container-editorial section-y">
          <SectionHeading
            eyebrow="Browse"
            title="Featured categories"
            description="Ten edits, from tailored formalwear to loop-back cotton. Each piece is produced in runs of fewer than four hundred."
          />
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((category, i) => (
              <Reveal key={category.slug} delay={(i % 5) * 0.05}>
                <Link
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  className="group block"
                >
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

      {/* Best sellers */}
      <section className="container-editorial section-y">
        <SectionHeading
          eyebrow="Most wanted"
          title="Best sellers"
          description="The pieces our customers return for, season after season."
          action={
            <Link to="/shop" className="text-xs uppercase tracking-[0.14em] link-underline">
              View all
            </Link>
          }
        />
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {bestSellers.slice(0, 4).map((product, i) => (
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
            alt="Model in a stone-coloured tailored suit walking through a minimal corridor"
            width={1600}
            height={912}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
          <div className="container-editorial relative flex h-full items-center">
            <Reveal className="max-w-lg text-white">
              <p className="eyebrow text-white/70">The Tailoring Project</p>
              <h2 className="mt-4 text-3xl leading-[1.15] md:text-5xl">
                Six weeks in Biella, one jacket
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/80">
                We spent the spring in the Italian mills that spin our wool, reworking a single
                jacket pattern until the shoulder sat right without padding.
              </p>
              <Link
                to="/about"
                className="mt-8 inline-block rounded-[8px] border border-white/60 px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:bg-white/10"
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
            <Link to="/shop" className="text-xs uppercase tracking-[0.14em] link-underline">
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
              <p className="eyebrow">Seasonal edit</p>
              <h2 className="mt-4 text-3xl leading-[1.15] md:text-[2.6rem]">
                Winter, in three weights
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Brushed alpaca for the mornings, double-faced wool for the walk in, and a
                cashmere scarf that folds into nothing. Built to layer without bulk.
              </p>
              <Link
                to="/category/$slug"
                params={{ slug: "winter" }}
                className="mt-8 inline-block rounded-[8px] bg-foreground px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
              >
                Shop winter
              </Link>
            </Reveal>
            <div className="grid grid-cols-2 gap-5 md:col-span-8 lg:grid-cols-3">
              {seasonal.slice(0, 3).map((product, i) => (
                <Reveal key={product.id} delay={i * 0.06}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-editorial section-y">
        <SectionHeading eyebrow="Customer notes" title="What people keep wearing" align="center" />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={review.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col border-t border-border pt-7">
                <StarRating rating={review.rating} />
                <blockquote className="mt-5 flex-1">
                  <p className="font-display text-lg leading-snug">{review.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                </blockquote>
                <figcaption className="mt-6 text-xs text-muted-foreground">
                  {review.name} — {review.location}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="border-t border-border">
        <div className="container-editorial section-y">
          <SectionHeading
            eyebrow="@ateliernord"
            title="Worn by you"
            description="Tag your pieces with #AtelierNord for a chance to be featured."
            align="center"
          />
          <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            {galleryImages.map((image, i) => (
              <Reveal key={i} delay={(i % 6) * 0.04}>
                <a
                  href="https://instagram.com"
                  className="group block overflow-hidden rounded-[8px] bg-secondary"
                  aria-label="View on Instagram"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={900}
                    height={1200}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-border bg-foreground text-background">
        <div className="container-editorial py-20 md:py-24">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6">
              <p className="eyebrow text-background/60">Newsletter</p>
              <h2 className="mt-4 text-3xl leading-[1.15] md:text-[2.6rem]">
                First look at each collection
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-background/70">
                One considered email a month: new pieces, restocks and notes from the studio.
                No discount countdowns.
              </p>
            </div>
            <div className="md:col-span-6 md:justify-self-end">
              <NewsletterForm className="border-background/30 text-background md:w-[26rem]" />
              <p className="mt-3 text-xs text-background/50">
                By subscribing you agree to our privacy policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
