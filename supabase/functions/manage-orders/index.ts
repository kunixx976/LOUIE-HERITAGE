import {
  json,
  OrderAuthenticationError,
  OrderAuthorizationError,
  preflight,
  requireStoreAdmin,
  serviceHeaders,
} from "../_shared/orders.ts";
import {
  checkRateLimit,
  rejectDisallowedOrigin,
  RateLimitServiceError,
} from "../_shared/security.ts";

const orderStatuses = new Set([
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
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stringField(value: unknown, maximum: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= maximum ? trimmed : null;
}

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  const blocked = rejectDisallowedOrigin(request);
  if (blocked) return blocked;
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, request);

  try {
    if (!(await checkRateLimit(request, "manage-orders", 60, 900))) {
      return json({ error: "Too many requests. Please try again later." }, 429, request);
    }

    const adminEmail = await requireStoreAdmin(request);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON." }, 400, request);
    }
    if (!isObject(body)) return json({ error: "Invalid request." }, 400, request);

    const { url, headers } = serviceHeaders();
    if (body.action === "list") {
      const params = new URLSearchParams({
        select:
          "id,order_number,customer_email,customer_name,shipping_address,items,subtotal,discount,shipping_fee,total,payment_method,payment_status,status,created_at,tracking_carrier,tracking_number,tracking_url,customer_request_type,customer_request_note,customer_request_status,customer_request_created_at,customer_request_resolved_at,customer_request_resolved_by,refund_status,refund_reference,refunded_at",
        order: "created_at.desc",
        limit: "250",
      });
      const response = await fetch(`${url}/rest/v1/orders?${params}`, { headers });
      if (!response.ok) {
        console.error("Unable to load orders for store administration.", response.status, await response.text());
        throw new Error("Unable to load orders. Please try again.");
      }
      return json({ orders: await response.json() }, 200, request);
    }

    if (body.action !== "update") return json({ error: "Unknown order action." }, 400, request);
    const orderNumber = stringField(body.orderNumber, 32);
    if (!orderNumber || !/^LH-[A-Z0-9]{8}$/.test(orderNumber)) {
      return json({ error: "Order number is invalid." }, 400, request);
    }

    const values: Record<string, unknown> = {};
    if ("status" in body) {
      if (typeof body.status !== "string" || !orderStatuses.has(body.status)) {
        return json({ error: "Order status is invalid." }, 400, request);
      }
      values.status = body.status;
    }
    if ("trackingCarrier" in body) {
      const value = stringField(body.trackingCarrier, 100);
      if (value === null) return json({ error: "Carrier name is too long." }, 400, request);
      values.tracking_carrier = value || null;
    }
    if ("trackingNumber" in body) {
      const value = stringField(body.trackingNumber, 100);
      if (value === null) return json({ error: "Tracking number is too long." }, 400, request);
      values.tracking_number = value || null;
    }
    if ("trackingUrl" in body) {
      const value = stringField(body.trackingUrl, 2048);
      if (value === null) return json({ error: "Tracking URL is too long." }, 400, request);
      if (value) {
        let parsed: URL;
        try {
          parsed = new URL(value);
        } catch {
          return json({ error: "Enter a valid tracking URL." }, 400, request);
        }
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          return json({ error: "Tracking URLs must use HTTP or HTTPS." }, 400, request);
        }
      }
      values.tracking_url = value || null;
    }

    const requestStatus = body.requestStatus;
    if (requestStatus !== undefined) {
      if (requestStatus !== "approved" && requestStatus !== "rejected") {
        return json({ error: "Request resolution must be approved or rejected." }, 400, request);
      }
      const currentResponse = await fetch(
        `${url}/rest/v1/orders?${new URLSearchParams({
          select: "customer_request_type,customer_request_status",
          order_number: `eq.${orderNumber}`,
          limit: "1",
        })}`,
        { headers },
      );
      if (!currentResponse.ok) {
        console.error("Unable to load order request for review.", currentResponse.status, await currentResponse.text());
        throw new Error("Unable to review this order request.");
      }
      const [current] = await currentResponse.json();
      if (!current || current.customer_request_status !== "pending") {
        return json({ error: "This order has no request awaiting review." }, 409, request);
      }
      values.customer_request_status = requestStatus;
      values.customer_request_resolved_at = new Date().toISOString();
      values.customer_request_resolved_by = adminEmail;
      if (requestStatus === "approved") {
        values.status =
          current.customer_request_type === "cancellation" ? "Cancelled" : "Return approved";
      }
    }

    if ("refundStatus" in body) {
      if (
        body.refundStatus !== "none" &&
        body.refundStatus !== "pending" &&
        body.refundStatus !== "processed"
      ) {
        return json({ error: "Refund status is invalid." }, 400, request);
      }
      const reference = body.refundReference === undefined
        ? null
        : stringField(body.refundReference, 200);
      if (body.refundReference !== undefined && reference === null) {
        return json({ error: "Refund reference is too long." }, 400, request);
      }
      if (body.refundStatus === "processed" && !reference) {
        return json({ error: "Enter the payment provider reference before marking a refund processed." }, 400, request);
      }
      values.refund_status = body.refundStatus;
      values.refund_reference = body.refundStatus === "none" ? null : reference;
      values.refunded_at = body.refundStatus === "processed" ? new Date().toISOString() : null;

      const paymentResponse = await fetch(
          `${url}/rest/v1/orders?${new URLSearchParams({
            select: "refund_status,payment_method,payment_status",
            order_number: `eq.${orderNumber}`,
            limit: "1",
          })}`,
          { headers },
        );
      if (!paymentResponse.ok) {
        console.error("Unable to verify payment before recording refund.", paymentResponse.status, await paymentResponse.text());
        throw new Error("Unable to verify payment before recording refund.");
      }
      const [payment] = await paymentResponse.json();
      if (!payment) return json({ error: "Order not found." }, 404, request);
      if (payment.refund_status === "processed" && body.refundStatus !== "processed") {
        return json({ error: "A processed refund record cannot be reversed." }, 409, request);
      }
      if (body.refundStatus === "processed") {
        if (
          payment.payment_method === "razorpay" &&
          payment.payment_status !== "paid" &&
          payment.payment_status !== "refunded"
        ) {
          return json({ error: "This online payment is not recorded as paid, so it cannot be marked refunded." }, 409, request);
        }
        if (payment.payment_method === "razorpay" && payment.payment_status === "paid") {
          values.payment_status = "refunded";
        }
      }
    } else if ("refundReference" in body) {
      return json({ error: "Refund status is required when changing its reference." }, 400, request);
    }

    if (Object.keys(values).length === 0) {
      return json({ error: "No order changes were provided." }, 400, request);
    }
    const params = new URLSearchParams({ order_number: `eq.${orderNumber}` });
    if (requestStatus !== undefined) params.set("customer_request_status", "eq.pending");
    const updateResponse = await fetch(`${url}/rest/v1/orders?${params}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(values),
    });
    if (!updateResponse.ok) {
      console.error("Unable to update order.", updateResponse.status, await updateResponse.text());
      throw new Error("Unable to save order changes. Please try again.");
    }
    const [updated] = await updateResponse.json();
    if (!updated) {
      return json({ error: "The order request changed before it could be reviewed. Refresh and try again." }, 409, request);
    }
    return json({ order: updated }, 200, request);
  } catch (error) {
    console.error("Unable to manage orders.", error);
    const status =
      error instanceof RateLimitServiceError
        ? 503
        : error instanceof OrderAuthenticationError
          ? 401
          : error instanceof OrderAuthorizationError
            ? 403
            : 500;
    return json(
      { error: error instanceof Error ? error.message : "Unable to manage orders." },
      status,
      request,
    );
  }
});
