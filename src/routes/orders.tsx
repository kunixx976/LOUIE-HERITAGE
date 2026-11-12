import { createFileRoute, Link } from "@tanstack/react-router";
import { formatPrice, useShop } from "@/lib/shop-store";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order History — LOUIE HERITAGE" },
      {
        name: "description",
        content: "View order status and any available carrier tracking details.",
      },
      { property: "og:title", content: "Order History — LOUIE HERITAGE" },
      {
        property: "og:description",
        content: "View order status and any available carrier tracking details.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { orders, user, hydrated, ordersLoading, ordersError } = useShop();

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Order history"
        description="View order status and any available delivery tracking details."
        crumbs={[{ label: "Account", to: "/profile" }, { label: "Orders" }]}
      />
      <div className="container-editorial py-12 md:py-16">
        {!hydrated || (user && ordersLoading) ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading your orders…
          </p>
        ) : !user ? (
          <div className="max-w-xl rounded-[10px] border border-border p-7">
            <h2 className="font-display text-2xl">Sign in to track your orders</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sign in with the verified email address used at checkout to see order status and
              delivery tracking details. Guest orders are linked to that email address.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-[8px] bg-foreground px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
            >
              Sign in
            </Link>
          </div>
        ) : ordersError ? (
          <div className="max-w-xl rounded-[10px] border border-border p-7">
            <p role="alert" className="text-sm">
              {ordersError}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-[8px] border border-border px-6 py-3 text-[11px] uppercase tracking-[0.14em] transition-colors hover:border-foreground"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="max-w-xl rounded-[10px] border border-border p-7">
            <h2 className="font-display text-2xl">No orders found</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Orders placed with this verified email address will appear here.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block text-xs uppercase tracking-[0.14em] link-underline"
            >
              Browse the collection
            </Link>
          </div>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => (
              <li key={order.id} className="rounded-[10px] border border-border p-7">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <p className="text-sm">{order.id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Placed {order.date}</p>
                  </div>
                  <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.12em]">
                    {order.status}
                  </span>
                  <span className="text-sm">{formatPrice(order.total)}</span>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Payment: {order.paymentMethod === "cod" ? "Cash on delivery" : "Online via Razorpay"} ·{" "}
                  {order.paymentStatus.replaceAll("_", " ")}
                </p>
                <ul className="mt-5 space-y-4">
                  {order.items.map((item, index) => (
                    <li
                      key={`${item.name}-${item.size}-${item.color}-${index}`}
                      className="flex items-center gap-4"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          width={900}
                          height={1200}
                          loading="lazy"
                          className="h-20 w-16 rounded-[6px] object-cover"
                        />
                      ) : null}
                      <div className="flex-1 text-sm">
                        <p>{item.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.color} · {item.size} · Quantity {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-border pt-5 text-sm">
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline"
                    >
                      Track with {order.trackingCarrier || "carrier"}
                      {order.trackingNumber ? ` · ${order.trackingNumber}` : ""}
                    </a>
                  ) : order.status === "Delivered" ? (
                    <p className="text-muted-foreground">This order is marked delivered.</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Carrier tracking will appear here when it is available.
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
