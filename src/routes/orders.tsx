import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatPrice, useShop, type Order } from "@/lib/shop-store";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/lib/supabase";

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
  const { orders, user, hydrated, ordersLoading, ordersError, reloadOrders } = useShop();
  const [requestingOrder, setRequestingOrder] = useState<string | null>(null);

  const submitRequest = async (order: Order, type: "cancellation" | "return", note: string) => {
    if (!supabase) {
      toast.error("Order requests are temporarily unavailable.");
      return false;
    }
    setRequestingOrder(order.id);
    try {
      const { error } = await supabase.functions.invoke("request-order-action", {
        body: { orderNumber: order.id, type, note },
      });
      if (error) throw error;
      toast.success("Your request has been sent for review.");
      await reloadOrders();
      return true;
    } catch (error) {
      console.error("Unable to submit an order service request.", error);
      toast.error(error instanceof Error ? error.message : "Unable to submit your request.");
      return false;
    } finally {
      setRequestingOrder(null);
    }
  };

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
                  Payment: {order.paymentMethod === "cod" ? "Cash on delivery" : "Online"} ·{" "}
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
                <OrderServiceRequest
                  order={order}
                  busy={requestingOrder === order.id}
                  onSubmit={submitRequest}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function OrderServiceRequest({
  order,
  busy,
  onSubmit,
}: {
  order: Order;
  busy: boolean;
  onSubmit: (order: Order, type: "cancellation" | "return", note: string) => Promise<boolean>;
}) {
  const type = order.status === "Delivered" ? "return" : "cancellation";
  const canRequest =
    type === "return"
      ? order.status === "Delivered"
      : ["Awaiting payment", "Processing", "Preparing"].includes(order.status);
  const [note, setNote] = useState("");

  if (order.requestStatus === "pending") {
    return (
      <div className="mt-5 rounded-[8px] bg-surface p-4 text-sm">
        <p className="font-medium">
          {order.requestType === "return" ? "Return" : "Cancellation"} request under review
        </p>
        {order.requestNote ? (
          <p className="mt-2 text-muted-foreground">{order.requestNote}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-border pt-5">
      {order.requestStatus ? (
        <p className="mb-3 text-xs text-muted-foreground">
          Your last {order.requestType} request was {order.requestStatus}.
          {order.requestNote ? ` Reason: ${order.requestNote}` : ""}
        </p>
      ) : null}
      {canRequest ? (
        <form
          className="max-w-xl"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit(order, type, note).then((submitted) => {
              if (submitted) setNote("");
            });
          }}
        >
          <label htmlFor={`order-request-${order.id}`} className="text-sm font-medium">
            Request {type === "return" ? "a return" : "cancellation"}
          </label>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            This sends a request for our team to review; it does not automatically cancel the order
            or issue a refund.
          </p>
          <textarea
            id={`order-request-${order.id}`}
            required
            minLength={10}
            maxLength={1000}
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Tell us why you are making this request"
            className="mt-3 w-full rounded-[8px] border border-border bg-background p-3 text-sm outline-none focus:border-foreground"
          />
          <button
            type="submit"
            disabled={busy || note.trim().length < 10}
            className="mt-3 rounded-[8px] border border-border px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Sending…" : `Submit ${type} request`}
          </button>
        </form>
      ) : null}
    </div>
  );
}
