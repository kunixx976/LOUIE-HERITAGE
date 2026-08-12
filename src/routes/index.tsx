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
      { title: "MishraClothings — Everyday Cotton, Denim & Ethnic Wear" },
      {
        name: "description",
        content:
          "Cotton T-shirts from Tirupur, denim from Ahmedabad, sarees from Surat and woollens from Ludhiana — shipped from Meerut. Free delivery over ₹1,499.",
      },
      { property: "og:title", content: "MishraClothings — Everyday Cotton, Denim & Ethnic Wear" },
      {
        property: "og:description",
        content:
          "Cotton, denim, ethnic wear and home textiles sourced straight from India's textile hubs.",
      },
    ],
  }),
  component: Home,
});

const promos = [
  { title: "Shop Women", slug: "women", copy: "Cotton, denim & ethnic wear" },
  { title: "Shop Men", slug: "men", copy: "Tees, shirts & straight-fit denim" },
  { title: "Winter Edit", slug: "winter", copy: "Ludhiana woollens & layers" },
];

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
                straight from the mill
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/90">
                Combed cotton tees, honest denim and festive ethnic wear — sourced directly from
                Tirupur, Ahmedabad and Surat, and shipped from our Meerut warehouse.
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
            description="Eleven edits, from combed cotton tees to Panipat home textiles — each sourced from the Indian town that does it best."
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
          description="The pieces our customers keep re-ordering, size after size."
          action={
            <Link to="/shop" className="text-sm font-medium transition-colors hover:text-muted-foreground">
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
            alt="Model in a cotton shirt and straight-fit denim in daylight"
            width={1600}
            height={912}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
          <div className="container-editorial relative flex h-full items-center">
            <Reveal className="max-w-lg text-white">
              <p className="eyebrow text-white/70">Where it comes from</p>
              <h2 className="mt-4 text-3xl leading-[1.15] md:text-5xl">
                From the mill floor
                to your door
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/80">
                We buy directly from the knitting units of Tirupur, the denim mills of Ahmedabad and
                the looms of Surat — no middlemen, no marked-up showroom price.
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
            <Link to="/shop" className="text-sm font-medium transition-colors hover:text-muted-foreground">
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
                Winter, the Ludhiana way
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Fine-gauge merino crews, long cardigans and a handloom throw from Panipat. Warm
                enough for a north Indian December, light enough to layer.
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
            eyebrow="@mishraclothings"
            title="Worn by you"
            description="Tag your pieces with #MishraClothings for a chance to be featured."
            align="center"
          />
          <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            {galleryImages.map((image, i) => (
              <Reveal key={i} delay={(i % 6) * 0.04}>
                <a
                  href="https://www.instagram.com/mishraclothings"
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
