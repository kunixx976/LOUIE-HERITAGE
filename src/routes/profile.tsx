import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { products } from "@/lib/data";
import { formatPrice, useShop } from "@/lib/shop-store";
import { PageHeader } from "@/components/site/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Account — Atelier Nord" },
      { name: "description", content: "Manage your Atelier Nord orders, wishlist, addresses and account settings." },
      { property: "og:title", content: "My Account — Atelier Nord" },
      { property: "og:description", content: "Manage orders, wishlist, addresses and settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, orders, wishlist, addresses, removeAddress, signOut, hydrated } = useShop();
  const saved = products.filter((p) => wishlist.includes(p.id));

  if (hydrated && !user) {
    return (
      <div className="container-editorial flex min-h-[60vh] items-center justify-center py-16 text-center">
        <div>
          <h1 className="text-3xl">You're not signed in</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to view your orders, addresses and saved pieces.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block rounded-[8px] bg-foreground px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Signed in as ${user?.email ?? ""}`}
        title={`Hello, ${user?.name ?? ""}`}
        crumbs={[{ label: "Account" }]}
      />
      <div className="container-editorial py-12 md:py-16">
        <Tabs defaultValue="dashboard">
          <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-none border-b border-border bg-transparent p-0">
            {["dashboard", "orders", "wishlist", "addresses", "settings"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 text-xs uppercase tracking-[0.14em] capitalize data-[state=active]:border-foreground data-[state=active]:shadow-none"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="pt-10">
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { label: "Orders placed", value: orders.length },
                { label: "Saved pieces", value: wishlist.length },
                { label: "Addresses", value: addresses.length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[10px] border border-border p-7">
                  <p className="font-display text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Members get free repairs on wool outerwear for two years, and early access to each
              collection 48 hours before release.
            </p>
          </TabsContent>

          <TabsContent value="orders" className="pt-10">
            <ul className="space-y-5">
              {orders.map((order) => (
                <li key={order.id} className="rounded-[10px] border border-border p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span>{order.id}</span>
                    <span className="text-muted-foreground">{order.date}</span>
                    <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em]">
                      {order.status}
                    </span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/orders" className="mt-8 inline-block text-xs uppercase tracking-[0.14em] link-underline">
              Full order history
            </Link>
          </TabsContent>

          <TabsContent value="wishlist" className="pt-10">
            {saved.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
            ) : (
              <ul className="space-y-4">
                {saved.map((p) => (
                  <li key={p.id} className="flex items-center gap-4 border-b border-border pb-4">
                    <img src={p.images[0]} alt="" width={900} height={1200} loading="lazy" className="h-20 w-16 rounded-[6px] object-cover" />
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="flex-1 text-sm">
                      {p.name}
                    </Link>
                    <span className="text-sm">{formatPrice(p.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="addresses" className="pt-10">
            <div className="grid gap-5 sm:grid-cols-2">
              {addresses.map((a) => (
                <div key={a.id} className="rounded-[10px] border border-border p-6 text-sm">
                  <p className="eyebrow mb-2">{a.label}{a.isDefault ? " · Default" : ""}</p>
                  <p>{a.name}</p>
                  <p className="text-muted-foreground">
                    {a.line1}, {a.postcode} {a.city}, {a.country}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeAddress(a.id)}
                    className="mt-4 text-xs text-muted-foreground link-underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="pt-10">
            <div className="max-w-sm space-y-4 text-sm">
              <p className="text-muted-foreground">
                Signed in as {user?.email}. Contact our care team to change your email address.
              </p>
              <button
                type="button"
                onClick={() => toast("Preferences saved")}
                className="w-full rounded-[8px] border border-border py-3.5 text-[11px] uppercase tracking-[0.16em] transition-colors hover:border-foreground"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  toast("Signed out");
                }}
                className="w-full rounded-[8px] bg-foreground py-3.5 text-[11px] uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
              >
                Sign out
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
