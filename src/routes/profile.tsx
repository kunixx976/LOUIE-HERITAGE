import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart, MapPin, PackageCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import editorial from "@/assets/editorial.jpg";
import { formatPrice, useShop, type Address } from "@/lib/shop-store";
import { PageHeader } from "@/components/site/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Account — LOUIE HERITAGE" },
      {
        name: "description",
        content: "Manage your LOUIE HERITAGE orders, wishlist, addresses and account settings.",
      },
      { property: "og:title", content: "My Account — LOUIE HERITAGE" },
      { property: "og:description", content: "Manage orders, wishlist, addresses and settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postcode: "",
    country: "India",
    isDefault: false,
  });
  const {
    user,
    orders,
    wishlist,
    addresses,
    addAddress,
    removeAddress,
    signOut,
    hydrated,
    authError,
    catalogProducts,
    customerDataLoading,
    customerDataError,
    retryCustomerData,
  } = useShop();
  const saved = catalogProducts.filter((p) => wishlist.includes(p.id));

  const updateAddressField = (field: keyof typeof addressForm, value: string | boolean) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
  };

  const saveAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address: Address = {
      ...addressForm,
      id: crypto.randomUUID(),
      name: addressForm.name.trim(),
      phone: addressForm.phone.trim(),
      line1: addressForm.line1.trim(),
      line2: addressForm.line2.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      postcode: addressForm.postcode.trim(),
      country: addressForm.country.trim(),
    };
    addAddress(address);
    setAddressForm({
      label: "Home",
      name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postcode: "",
      country: "India",
      isDefault: false,
    });
    toast("Address saved");
  };

  if (!hydrated) {
    return (
      <div className="container-editorial flex min-h-[60vh] items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Loading your account…</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="container-editorial flex min-h-[60vh] items-center justify-center py-16 text-center">
        <div>
          <h1 className="text-3xl">Your account could not be loaded</h1>
          <p role="alert" className="mt-3 text-sm text-muted-foreground">
            {authError}
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block text-xs uppercase tracking-[0.14em] link-underline"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
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
        eyebrow={`Signed in as ${user.email}`}
        title={`Hello, ${user.name}`}
        crumbs={[{ label: "Account" }]}
        narrow
      />
      <div className="container-editorial py-12 md:py-16">
        {customerDataLoading || customerDataError ? (
          <div
            role={customerDataError ? "alert" : "status"}
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-border bg-surface p-4 text-sm text-muted-foreground"
          >
            <span>
              {customerDataError
                ? "Your cart, wishlist and saved addresses could not sync to your account."
                : "Loading your saved cart, wishlist and addresses…"}
            </span>
            {customerDataError ? (
              <button
                type="button"
                onClick={() => void retryCustomerData()}
                className="link-underline"
              >
                Retry sync
              </button>
            ) : null}
          </div>
        ) : null}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="relative min-h-[300px] overflow-hidden rounded-[10px] bg-foreground text-background sm:min-h-[360px] lg:col-span-7">
                <img
                  src={editorial}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                <div className="relative flex h-full min-h-[300px] max-w-lg flex-col items-start justify-end p-7 sm:min-h-[360px] sm:p-10">
                  <p className="eyebrow text-white/75">A considered collection</p>
                  <h2 className="mt-4 max-w-md text-4xl leading-[1.05] text-white sm:text-5xl">
                    A little space for what you love.
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
                    Thoughtful pieces for the everyday, chosen just for you.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-7 inline-flex h-11 items-center gap-3 rounded-full bg-white px-5 text-xs font-medium text-black transition-colors hover:bg-white/85"
                  >
                    Discover the collection
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
                {[
                  { label: "Orders placed", value: orders.length, icon: PackageCheck },
                  { label: "Saved pieces", value: wishlist.length, icon: Heart },
                  { label: "Addresses", value: addresses.length, icon: MapPin },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-[10px] border border-border bg-white/60 p-5 transition-colors hover:bg-white sm:flex-col sm:items-start sm:justify-center sm:p-6 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <p className="font-display text-3xl leading-none">{stat.value}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                    <stat.icon
                      aria-hidden="true"
                      className="h-5 w-5 text-muted-foreground"
                      strokeWidth={1.4}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 border-t border-border pt-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Your account</p>
                  <h2 className="mt-2 text-3xl">Everything in its place</h2>
                </div>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Pick up where you left off, or make room for something new.
                </p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    value: "orders",
                    title: "Order history",
                    description: "Follow your latest purchases.",
                    icon: PackageCheck,
                  },
                  {
                    value: "wishlist",
                    title: "Saved pieces",
                    description: "Your shortlist, all together.",
                    icon: Heart,
                  },
                  {
                    value: "addresses",
                    title: "Your addresses",
                    description: "Ready for the next delivery.",
                    icon: MapPin,
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setActiveTab(item.value)}
                    className="group flex h-auto items-start justify-between gap-5 rounded-[10px] border border-border bg-transparent p-5 text-left whitespace-normal transition-colors hover:border-foreground hover:bg-white"
                  >
                    <span>
                      <span className="block text-sm font-medium">{item.title}</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    <item.icon
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="pt-10">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No orders are linked to this account yet.
              </p>
            ) : (
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
            )}
            <Link
              to="/orders"
              className="mt-8 inline-block text-xs uppercase tracking-[0.14em] link-underline"
            >
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
                    <img
                      src={p.images[0]}
                      alt=""
                      width={900}
                      height={1200}
                      loading="lazy"
                      className="h-20 w-16 rounded-[6px] object-cover"
                    />
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
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
              <section aria-labelledby="saved-addresses-heading">
                <div className="mb-5">
                  <p className="eyebrow">Delivery details</p>
                  <h2 id="saved-addresses-heading" className="mt-2 text-3xl">
                    Your addresses
                  </h2>
                </div>
                {addresses.length === 0 ? (
                  <div className="rounded-[10px] border border-dashed border-border bg-white/50 px-6 py-10 text-center">
                    <MapPin className="mx-auto h-5 w-5 text-muted-foreground" strokeWidth={1.4} />
                    <p className="mt-3 text-sm">No saved addresses yet.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add one to make your next checkout a little easier.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <article
                        key={address.id}
                        className="rounded-[10px] border border-border bg-white/60 p-5 text-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="eyebrow">
                            {address.label}
                            {address.isDefault ? " · Default" : ""}
                          </p>
                          <MapPin
                            aria-hidden="true"
                            className="h-4 w-4 text-muted-foreground"
                            strokeWidth={1.4}
                          />
                        </div>
                        <p className="mt-3 font-medium">{address.name}</p>
                        <p className="mt-1 text-muted-foreground">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ""}
                          <br />
                          {[address.city, address.state, address.postcode]
                            .filter(Boolean)
                            .join(", ")}
                          <br />
                          {address.country}
                        </p>
                        {address.phone ? (
                          <p className="mt-2 text-xs text-muted-foreground">{address.phone}</p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeAddress(address.id)}
                          disabled={customerDataLoading || Boolean(customerDataError)}
                          className="mt-4 text-xs text-muted-foreground link-underline"
                        >
                          Remove
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <form
                onSubmit={saveAddress}
                className="rounded-[10px] border border-border bg-white/70 p-5 sm:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="eyebrow">New delivery location</p>
                    <h2 className="mt-1 font-display text-2xl">Add an address</h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs text-muted-foreground">
                    Address label
                    <Input
                      required
                      value={addressForm.label}
                      onChange={(event) => updateAddressField("label", event.target.value)}
                      placeholder="Home, work…"
                      className="h-11 rounded-[8px] border-border bg-background text-sm text-foreground shadow-none"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-muted-foreground">
                    Full name
                    <Input
                      required
                      autoComplete="name"
                      value={addressForm.name}
                      onChange={(event) => updateAddressField("name", event.target.value)}
                      placeholder="Name on the delivery"
                      className="h-11 rounded-[8px] border-border bg-background text-sm text-foreground shadow-none"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-muted-foreground sm:col-span-2">
                    Phone number
                    <Input
                      required
                      type="tel"
                      autoComplete="tel"
                      value={addressForm.phone}
                      onChange={(event) => updateAddressField("phone", event.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-11 rounded-[8px] border-border bg-background text-sm text-foreground shadow-none"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-muted-foreground sm:col-span-2">
                    Address
                    <Input
                      required
                      autoComplete="address-line1"
                      value={addressForm.line1}
                      onChange={(event) => updateAddressField("line1", event.target.value)}
                      placeholder="House number and street"
                      className="h-11 rounded-[8px] border-border bg-background text-sm text-foreground shadow-none"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-muted-foreground sm:col-span-2">
                    Apartment, suite, etc.{" "}
                    <span className="text-muted-foreground/70">Optional</span>
                    <Input
                      autoComplete="address-line2"
                      value={addressForm.line2}
                      onChange={(event) => updateAddressField("line2", event.target.value)}
                      placeholder="Flat, floor, landmark"
                      className="h-11 rounded-[8px] border-border bg-background text-sm text-foreground shadow-none"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-muted-foreground">
                    City
                    <Input
                      required
                      autoComplete="address-level2"
                      value={addressForm.city}
                      onChange={(event) => updateAddressField("city", event.target.value)}
                      className="h-11 rounded-[8px] border-border bg-background text-sm text-foreground shadow-none"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-muted-foreground">
                    State
                    <Input
                      required
                      autoComplete="address-level1"
                      value={addressForm.state}
                      onChange={(event) => updateAddressField("state", event.target.value)}
                      className="h-11 rounded-[8px] border-border bg-background text-sm text-foreground shadow-none"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-muted-foreground">
                    PIN code
                    <Input
                      required
                      autoComplete="postal-code"
                      inputMode="numeric"
                      value={addressForm.postcode}
                      onChange={(event) => updateAddressField("postcode", event.target.value)}
                      className="h-11 rounded-[8px] border-border bg-background text-sm text-foreground shadow-none"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-muted-foreground">
                    Country
                    <Input
                      required
                      autoComplete="country-name"
                      value={addressForm.country}
                      onChange={(event) => updateAddressField("country", event.target.value)}
                      className="h-11 rounded-[8px] border-border bg-background text-sm text-foreground shadow-none"
                    />
                  </label>
                </div>

                <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-xs text-muted-foreground">
                  <Checkbox
                    checked={addressForm.isDefault}
                    onCheckedChange={(checked) => updateAddressField("isDefault", checked === true)}
                  />
                  Set as my default address
                </label>

                <button
                  type="submit"
                  disabled={customerDataLoading || Boolean(customerDataError)}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground px-6 text-[11px] font-medium uppercase tracking-[0.14em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save address
                </button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="pt-10">
            <div className="max-w-sm space-y-4 text-sm">
              <p className="text-muted-foreground">
                Signed in as {user.email}. Contact our care team to change your email address.
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
                onClick={async () => {
                  try {
                    await signOut();
                    toast("Signed out");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Unable to sign out.");
                  }
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
