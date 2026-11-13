import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — LOUIE HERITAGE" },
      { name: "description", content: "The LOUIE HERITAGE pieces you've saved for later." },
      { property: "og:title", content: "Wishlist — LOUIE HERITAGE" },
      { property: "og:description", content: "The pieces you've saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, hydrated, catalogProducts, customerDataError, retryCustomerData } = useShop();
  const saved = catalogProducts.filter((p) => wishlist.includes(p.id));

  return (
    <>
      <PageHeader
        eyebrow="Saved"
        title="Wishlist"
        description="Pieces you've set aside. We'll let you know if anything sells out or returns in a new colour."
        crumbs={[{ label: "Wishlist" }]}
      />
      <div className="container-editorial py-12 md:py-16">
        {customerDataError ? (
          <p role="alert" className="mb-6 rounded-[8px] border border-border bg-surface p-4 text-sm text-muted-foreground">
            Your account wishlist could not be synced. Changes may not be available on your other
            devices.{" "}
            <button
              type="button"
              onClick={() => void retryCustomerData()}
              className="link-underline"
            >
              Retry
            </button>
          </p>
        ) : null}
        {!hydrated ? null : saved.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-2xl">Nothing saved yet</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Tap the heart on any piece to keep it here.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-block rounded-[8px] bg-foreground px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
            >
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
