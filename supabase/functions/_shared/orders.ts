import { checkoutCatalog } from "./checkout-catalog.ts";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export class OrderAuthenticationError extends Error {}

export type CheckoutItemInput = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

export type CheckoutInput = {
  email: string;
  name: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
  shippingMethod: "standard" | "express";
  couponCode?: string;
  items: CheckoutItemInput[];
};

export type PricedItem = CheckoutItemInput & { name: string; unitPrice: number };

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

export function preflight(request: Request) {
  return request.method === "OPTIONS" ? new Response("ok", { headers }) : null;
}

export async function readCheckout(request: Request): Promise<{
  input: CheckoutInput;
  items: PricedItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  orderNumber: string;
}> {
  const input = (await request.json()) as CheckoutInput;
  if (
    !input ||
    typeof input.email !== "string" ||
    input.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
    typeof input.name !== "string" ||
    input.name.trim().length < 2 ||
    input.name.trim().length > 100 ||
    typeof input.line1 !== "string" ||
    input.line1.trim().length < 4 ||
    input.line1.trim().length > 200 ||
    typeof input.city !== "string" ||
    input.city.trim().length < 2 ||
    input.city.trim().length > 100 ||
    typeof input.postcode !== "string" ||
    !/^[1-9]\d{5}$/.test(input.postcode) ||
    typeof input.country !== "string" ||
    input.country.trim().length < 2 ||
    input.country.trim().length > 60 ||
    !["standard", "express"].includes(input.shippingMethod) ||
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    input.items.length > 50
  ) {
    throw new Error("Please check your contact, delivery and cart details.");
  }

  const items = input.items.map((item) => {
    if (!Object.hasOwn(checkoutCatalog, item.productId)) {
      throw new Error("Your bag contains an invalid item. Please refresh it and try again.");
    }
    const product = checkoutCatalog[item.productId as keyof typeof checkoutCatalog];
    if (
      !product ||
      typeof item.size !== "string" ||
      item.size.length < 1 ||
      item.size.length > 30 ||
      typeof item.color !== "string" ||
      item.color.length < 1 ||
      item.color.length > 60 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10
    ) {
      throw new Error("Your bag contains an invalid item. Please refresh it and try again.");
    }
    return {
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      name: product.name,
      unitPrice: product.price,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = input.couponCode?.toUpperCase() === "STUDIO10" ? Math.round(subtotal * 0.1) : 0;
  const shippingFee = input.shippingMethod === "express" ? 199 : subtotal > 1499 ? 0 : 79;
  const total = subtotal - discount + shippingFee;

  return {
    input,
    items,
    subtotal,
    discount,
    shippingFee,
    total,
    orderNumber: `LH-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
  };
}

export function serviceHeaders() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Order storage is not configured on the server.");
  return {
    url,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  };
}

export async function hashPaymentToken(token: string) {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)),
  );
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function saveOrder(values: Record<string, unknown>) {
  const { url, headers: authHeaders } = serviceHeaders();
  const response = await fetch(`${url}/rest/v1/orders`, {
    method: "POST",
    headers: { ...authHeaders, Prefer: "return=representation" },
    body: JSON.stringify(values),
  });
  if (!response.ok) {
    console.error("Order insert failed.", response.status, await response.text());
    throw new Error("We couldn't save your order. Please try again.");
  }
  return (await response.json())[0] as Record<string, unknown>;
}

export async function sendOrderConfirmation(order: {
  orderNumber: string;
  email: string;
  name: string;
  items: PricedItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  method: "razorpay" | "cod";
  address: CheckoutInput;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("ORDER_FROM_EMAIL");
  if (!apiKey || !from) {
    console.error("Order email not sent: RESEND_API_KEY or ORDER_FROM_EMAIL is not configured.");
    return false;
  }
  const escapeHtml = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
    );
  const lines = order.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.name)} (${escapeHtml(item.size)}, ${escapeHtml(item.color)}) × ${item.quantity} — ₹${item.unitPrice * item.quantity}</li>`,
    )
    .join("");
  const address = [
    order.address.line1,
    order.address.city,
    order.address.postcode,
    order.address.country,
  ]
    .map(escapeHtml)
    .join(", ");
  const payment = order.method === "cod" ? "Cash on delivery" : "Paid online";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [order.email],
        subject: `Order ${order.orderNumber} confirmed — LOUIE HERITAGE`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111"><h1>Thank you, ${escapeHtml(order.name)}.</h1><p>Your order <strong>${escapeHtml(order.orderNumber)}</strong> is confirmed.</p><ul>${lines}</ul><p>Subtotal: ₹${order.subtotal}<br>Discount: −₹${order.discount}<br>Delivery: ₹${order.shippingFee}<br><strong>Total: ₹${order.total}</strong></p><p>Payment: ${payment}</p><p>Delivering to: ${address}</p><p>LOUIE HERITAGE</p></div>`,
        text: `Thank you, ${order.name}. Order ${order.orderNumber} is confirmed. Total: ₹${order.total}. Payment: ${payment}. Delivering to: ${address}.`,
      }),
    });
    if (!response.ok) {
      console.error("Resend rejected order confirmation.", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Unable to reach Resend for order confirmation.", error);
    return false;
  }
}

export async function markEmailSent(orderNumber: string) {
  try {
    const { url, headers: authHeaders } = serviceHeaders();
    const response = await fetch(
      `${url}/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}`,
      {
        method: "PATCH",
        headers: { ...authHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({ confirmation_email_sent_at: new Date().toISOString() }),
      },
    );
    if (!response.ok) {
      console.error("Unable to update order email status.", response.status, await response.text());
    }
  } catch (error) {
    console.error("Unable to persist order email status.", error);
  }
}

export async function getVerifiedCustomerEmail(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new OrderAuthenticationError(
      "Sign in with a verified email address to view your orders.",
    );
  }

  const { url, headers } = serviceHeaders();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? headers.apikey,
      Authorization: authorization,
    },
  });
  if (!response.ok) {
    throw new OrderAuthenticationError("Your session could not be verified. Please sign in again.");
  }

  const user = (await response.json()) as {
    email?: unknown;
    email_confirmed_at?: unknown;
    confirmed_at?: unknown;
  };
  if (typeof user.email !== "string" || !(user.email_confirmed_at || user.confirmed_at)) {
    throw new OrderAuthenticationError("Verify your email address before viewing order history.");
  }
  return user.email.trim().toLowerCase();
}

export async function listCustomerOrders(email: string) {
  const { url, headers } = serviceHeaders();
  const params = new URLSearchParams({
    select:
      "order_number,status,total,payment_method,payment_status,items,created_at,tracking_carrier,tracking_number,tracking_url",
    customer_email: `eq.${email}`,
    order: "created_at.desc",
    limit: "100",
  });
  const response = await fetch(`${url}/rest/v1/orders?${params}`, { headers });
  if (!response.ok) {
    console.error("Unable to load customer orders.", response.status, await response.text());
    throw new Error("We couldn't load your orders. Please try again.");
  }
  return await response.json();
}

export async function markPaymentFailed(razorpayOrderId: string, paymentId: string) {
  const { url, headers } = serviceHeaders();
  const params = new URLSearchParams({
    razorpay_order_id: `eq.${razorpayOrderId}`,
    payment_status: "eq.pending",
  });
  const response = await fetch(`${url}/rest/v1/orders?${params}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({
      razorpay_payment_id: paymentId,
      payment_status: "failed",
      status: "Payment failed",
    }),
  });
  if (!response.ok) {
    console.error("Unable to record failed payment.", response.status, await response.text());
    throw new Error("Unable to update the failed payment status.");
  }
}

export async function markPaymentAbandoned(razorpayOrderId: string, token: string) {
  const tokenHash = await hashPaymentToken(token);
  const { url, headers } = serviceHeaders();
  const params = new URLSearchParams({
    razorpay_order_id: `eq.${razorpayOrderId}`,
    abandonment_token_hash: `eq.${tokenHash}`,
    payment_status: "eq.pending",
  });
  const response = await fetch(`${url}/rest/v1/orders?${params}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({
      payment_status: "failed",
      status: "Payment abandoned",
    }),
  });
  if (!response.ok) {
    console.error("Unable to record abandoned payment.", response.status, await response.text());
    throw new Error("Unable to update the abandoned payment status.");
  }
  const updated = (await response.json()) as unknown[];
  if (updated.length > 0) return true;

  const currentResponse = await fetch(
    `${url}/rest/v1/orders?${new URLSearchParams({
      select: "status,payment_status",
      razorpay_order_id: `eq.${razorpayOrderId}`,
      abandonment_token_hash: `eq.${tokenHash}`,
    })}`,
    { headers },
  );
  if (!currentResponse.ok) {
    console.error(
      "Unable to check abandoned payment status.",
      currentResponse.status,
      await currentResponse.text(),
    );
    throw new Error("Unable to check payment status.");
  }
  const [current] = await currentResponse.json();
  return (
    current?.payment_status === "failed" &&
    ["Payment failed", "Payment abandoned"].includes(current.status)
  );
}

export async function validateOrderPayment(
  razorpayOrderId: string,
  amount: number,
  currency: string,
) {
  const { url, headers } = serviceHeaders();
  const params = new URLSearchParams({
    select: "total,currency",
    razorpay_order_id: `eq.${razorpayOrderId}`,
  });
  const response = await fetch(`${url}/rest/v1/orders?${params}`, { headers });
  if (!response.ok) {
    console.error("Unable to load payment order.", response.status, await response.text());
    throw new Error("Unable to check the order amount before payment capture.");
  }
  const [order] = await response.json();
  if (!order) return false;
  if (amount !== order.total * 100 || currency !== order.currency) {
    throw new Error("Payment amount does not match the saved order.");
  }
  return true;
}

export async function finalizePaidOrder(
  razorpayOrderId: string,
  paymentId: string,
  amount: number,
  currency: string,
) {
  const { url, headers } = serviceHeaders();
  const orderResponse = await fetch(
    `${url}/rest/v1/orders?razorpay_order_id=eq.${encodeURIComponent(razorpayOrderId)}&select=*`,
    { headers },
  );
  if (!orderResponse.ok) throw new Error("Unable to load the order for payment confirmation.");
  const [order] = await orderResponse.json();
  if (!order) return null;
  if (amount !== order.total * 100 || currency !== order.currency) {
    throw new Error("Payment details did not match this order.");
  }
  if (order.payment_status === "paid") {
    if (order.razorpay_payment_id !== paymentId) {
      throw new Error("A different payment has already been applied to this order.");
    }
    let emailSent = Boolean(order.confirmation_email_sent_at);
    if (!emailSent) {
      emailSent = await sendOrderConfirmation({
        orderNumber: order.order_number,
        email: order.customer_email,
        name: order.customer_name,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shipping_fee,
        total: order.total,
        method: "razorpay",
        address: order.shipping_address,
      });
      if (emailSent) await markEmailSent(order.order_number);
    }
    return {
      orderNumber: order.order_number as string,
      emailSent,
      total: order.total as number,
    };
  }

  const updateParams = new URLSearchParams({
    razorpay_order_id: `eq.${razorpayOrderId}`,
    payment_status: "in.(pending,failed)",
  });
  const updateResponse = await fetch(`${url}/rest/v1/orders?${updateParams}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({
      razorpay_payment_id: paymentId,
      payment_status: "paid",
      status: "Processing",
    }),
  });
  if (!updateResponse.ok)
    throw new Error("Payment was captured, but the order could not be updated.");
  const updated = (await updateResponse.json()) as unknown[];
  if (updated.length === 0) {
    const retry = await fetch(
      `${url}/rest/v1/orders?razorpay_order_id=eq.${encodeURIComponent(razorpayOrderId)}&select=*`,
      { headers },
    );
    if (!retry.ok) throw new Error("Unable to verify the updated order.");
    const [current] = await retry.json();
    if (current?.payment_status === "paid" && current.razorpay_payment_id === paymentId) {
      return finalizePaidOrder(razorpayOrderId, paymentId, amount, currency);
    }
    throw new Error("This order is no longer awaiting payment.");
  }

  const emailSent = await sendOrderConfirmation({
    orderNumber: order.order_number,
    email: order.customer_email,
    name: order.customer_name,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    shippingFee: order.shipping_fee,
    total: order.total,
    method: "razorpay",
    address: order.shipping_address,
  });
  if (emailSent) await markEmailSent(order.order_number);
  return {
    orderNumber: order.order_number as string,
    emailSent,
    total: order.total as number,
  };
}

export function razorpayCredentials() {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured on the server.");
  return { keyId, keySecret };
}

export function getCheckoutDetails(input: CheckoutInput, items: PricedItem[]) {
  return {
    customer_email: input.email.trim().toLowerCase(),
    customer_name: input.name.trim(),
    shipping_address: {
      line1: input.line1.trim(),
      city: input.city.trim(),
      postcode: input.postcode.trim(),
      country: input.country.trim(),
    },
    items,
  };
}
