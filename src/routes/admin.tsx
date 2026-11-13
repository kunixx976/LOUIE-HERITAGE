import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/PageHeader";
import { formatPrice, useShop } from "@/lib/shop-store";
import { supabase } from "@/lib/supabase";

type AdminOrder = {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  shipping_address: {
    line1?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  items: {
    name: string;
    quantity: number;
    size: string;
    color: string;
    unitPrice: number;
  }[];
  total: number;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  payment_method: "razorpay" | "cod";
  payment_status: string;
  status: string;
  created_at: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  customer_request_type: "cancellation" | "return" | null;
  customer_request_note: string | null;
  customer_request_status: "pending" | "approved" | "rejected" | null;
  customer_request_created_at: string | null;
  refund_status: "none" | "pending" | "processed";
  refund_reference: string | null;
  refunded_at: string | null;
};

const orderStatuses = [
  "Awaiting payment",
  "Processing",
  "Preparing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Return approved",
  "Returned",
  "Payment failed",
  "Payment abandoned",
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Order administration — LOUIE HERITAGE" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, hydrated } = useShop();
  const userId = user?.id;
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!userId || !supabase) {
      setLoading(false);
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("manage-orders", {
        body: { action: "list" },
      });
      if (invokeError) throw invokeError;
      if (!data || !Array.isArray(data.orders)) throw new Error("Order list returned an invalid response.");
      setOrders(data.orders as AdminOrder[]);
    } catch (cause) {
      console.error("Unable to load administration orders.", cause);
      setError(cause instanceof Error ? cause.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (hydrated) void loadOrders();
  }, [hydrated, loadOrders]);

  const updateOrder = async (
    orderNumber: string,
    patch: Record<string, string | null>,
    successMessage: string,
  ) => {
    if (!supabase) {
      toast.error("Order administration is temporarily unavailable.");
      return;
    }
    setBusy(orderNumber);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("manage-orders", {
        body: { action: "update", orderNumber, ...patch },
      });
      if (invokeError) throw invokeError;
      if (!data?.order) throw new Error("Order update returned an invalid response.");
      setOrders((current) =>
        current.map((order) => (order.order_number === orderNumber ? data.order : order)),
      );
      toast.success(successMessage);
    } catch (cause) {
      console.error("Unable to update order.", cause);
      toast.error(cause instanceof Error ? cause.message : "Unable to save order changes.");
    } finally {
      setBusy(null);
    }
  };

  if (!hydrated || (user && loading)) {
    return (
      <div className="container-editorial py-16">
        <p role="status" className="text-sm text-muted-foreground">Loading order administration…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader eyebrow="Store operations" title="Order administration" />
        <div className="container-editorial py-12">
          <p className="text-sm text-muted-foreground">Sign in with an administrator account to continue.</p>
          <Link to="/login" className="mt-5 inline-block text-xs uppercase tracking-[0.14em] link-underline">
            Sign in
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Store operations"
        title="Order administration"
        description="Update fulfillment, delivery tracking, customer requests and refund records."
        crumbs={[{ label: "Order administration" }]}
      />
      <div className="container-editorial py-10 md:py-14">
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadOrders()}
            className="rounded-[8px] border border-border px-5 py-3 text-[10px] uppercase tracking-[0.14em] hover:border-foreground disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh orders"}
          </button>
        </div>
        {error ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-border p-5">
            <p role="alert" className="text-sm">{error}</p>
            <button type="button" onClick={() => void loadOrders()} className="text-xs uppercase tracking-[0.14em] link-underline">
              Retry
            </button>
          </div>
        ) : null}
        {!error && orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders have been placed yet.</p>
        ) : null}
        <div className="space-y-6">
          {orders.map((order) => (
            <article key={order.order_number} className="rounded-[10px] border border-border p-5 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                <div>
                  <h2 className="font-display text-xl">{order.order_number}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatPrice(order.total)}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {order.payment_method} · {order.payment_status.replaceAll("_", " ")}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 py-5 md:grid-cols-2">
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-[0.14em]">Customer</h3>
                  <p className="mt-3 text-sm">{order.customer_name}</p>
                  <a className="mt-1 block text-sm link-underline" href={`mailto:${order.customer_email}`}>
                    {order.customer_email}
                  </a>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {[
                      order.shipping_address.line1,
                      order.shipping_address.city,
                      order.shipping_address.postcode,
                      order.shipping_address.country,
                    ].filter(Boolean).join(", ")}
                  </p>
                </section>
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-[0.14em]">Items</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {order.items.map((item, index) => (
                      <li key={`${item.name}-${index}`} className="flex justify-between gap-3">
                        <span>{item.name} · {item.color} · {item.size} × {item.quantity}</span>
                        <span className="shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="border-t border-border pt-5">
                <h3 className="text-xs font-medium uppercase tracking-[0.14em]">Fulfillment and tracking</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="text-xs text-muted-foreground">
                    Order status
                    <select
                      value={order.status}
                      onChange={(event) => setOrders((current) =>
                        current.map((item) => item.order_number === order.order_number
                          ? { ...item, status: event.target.value }
                          : item),
                      )}
                      className="mt-1 h-11 w-full rounded-[6px] border border-border bg-background px-3 text-sm text-foreground"
                    >
                      {!orderStatuses.includes(order.status) ? <option value={order.status}>{order.status}</option> : null}
                      {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Carrier
                    <input
                      value={order.tracking_carrier ?? ""}
                      onChange={(event) => setOrders((current) =>
                        current.map((item) => item.order_number === order.order_number
                          ? { ...item, tracking_carrier: event.target.value }
                          : item),
                      )}
                      maxLength={100}
                      className="mt-1 h-11 w-full rounded-[6px] border border-border bg-background px-3 text-sm text-foreground"
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Tracking number
                    <input
                      value={order.tracking_number ?? ""}
                      onChange={(event) => setOrders((current) =>
                        current.map((item) => item.order_number === order.order_number
                          ? { ...item, tracking_number: event.target.value }
                          : item),
                      )}
                      maxLength={100}
                      className="mt-1 h-11 w-full rounded-[6px] border border-border bg-background px-3 text-sm text-foreground"
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Tracking URL
                    <input
                      type="url"
                      value={order.tracking_url ?? ""}
                      onChange={(event) => setOrders((current) =>
                        current.map((item) => item.order_number === order.order_number
                          ? { ...item, tracking_url: event.target.value }
                          : item),
                      )}
                      maxLength={2048}
                      className="mt-1 h-11 w-full rounded-[6px] border border-border bg-background px-3 text-sm text-foreground"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={busy === order.order_number}
                  onClick={() => void updateOrder(order.order_number, {
                    status: order.status,
                    trackingCarrier: order.tracking_carrier ?? "",
                    trackingNumber: order.tracking_number ?? "",
                    trackingUrl: order.tracking_url ?? "",
                  }, "Order details saved.")}
                  className="mt-4 rounded-[8px] bg-foreground px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-background disabled:opacity-50"
                >
                  {busy === order.order_number ? "Saving…" : "Save fulfillment"}
                </button>
              </section>

              {order.customer_request_status ? (
                <section className="mt-6 border-t border-border pt-5">
                  <h3 className="text-xs font-medium uppercase tracking-[0.14em]">Customer request</h3>
                  <p className="mt-3 text-sm">
                    {order.customer_request_type} · {order.customer_request_status}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {order.customer_request_note}
                  </p>
                  {order.customer_request_status === "pending" ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={busy === order.order_number}
                        onClick={() => void updateOrder(order.order_number, { requestStatus: "approved" }, "Customer request approved.")}
                        className="rounded-[8px] border border-border px-5 py-3 text-[10px] uppercase tracking-[0.14em] hover:border-foreground disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busy === order.order_number}
                        onClick={() => void updateOrder(order.order_number, { requestStatus: "rejected" }, "Customer request rejected.")}
                        className="rounded-[8px] border border-border px-5 py-3 text-[10px] uppercase tracking-[0.14em] hover:border-foreground disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className="mt-6 border-t border-border pt-5">
                <h3 className="text-xs font-medium uppercase tracking-[0.14em]">Refund record</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Process refunds in the payment provider or with the customer first. This page records the outcome; it does not move money.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
                  <label className="text-xs text-muted-foreground">
                    Refund status
                    <select
                      value={order.refund_status}
                      onChange={(event) => setOrders((current) =>
                        current.map((item) => item.order_number === order.order_number
                          ? { ...item, refund_status: event.target.value as AdminOrder["refund_status"] }
                          : item),
                      )}
                      className="mt-1 h-11 w-full rounded-[6px] border border-border bg-background px-3 text-sm text-foreground"
                    >
                      <option value="none">No refund</option>
                      <option value="pending">Pending</option>
                      <option value="processed">Processed</option>
                    </select>
                  </label>
                  <label className="text-xs text-muted-foreground">
                    External payment/refund reference
                    <input
                      value={order.refund_reference ?? ""}
                      onChange={(event) => setOrders((current) =>
                        current.map((item) => item.order_number === order.order_number
                          ? { ...item, refund_reference: event.target.value }
                          : item),
                      )}
                      maxLength={200}
                      className="mt-1 h-11 w-full rounded-[6px] border border-border bg-background px-3 text-sm text-foreground"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy === order.order_number}
                    onClick={() => void updateOrder(order.order_number, {
                      refundStatus: order.refund_status,
                      refundReference: order.refund_reference ?? "",
                    }, "Refund record saved.")}
                    className="rounded-[8px] border border-border px-5 py-3 text-[10px] uppercase tracking-[0.14em] hover:border-foreground disabled:opacity-50"
                  >
                    Save refund
                  </button>
                </div>
                {order.refunded_at ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Recorded {new Date(order.refunded_at).toLocaleString("en-IN")}
                  </p>
                ) : null}
              </section>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
