import {
  getVerifiedCustomerEmail,
  json,
  OrderAuthenticationError,
  preflight,
  serviceHeaders,
} from "../_shared/orders.ts";
import {
  checkRateLimit,
  rejectDisallowedOrigin,
  RateLimitServiceError,
} from "../_shared/security.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  const blocked = rejectDisallowedOrigin(request);
  if (blocked) return blocked;
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, request);

  try {
    if (!(await checkRateLimit(request, "order-service-request-ip", 10, 900))) {
      return json({ error: "Too many requests. Please try again later." }, 429, request);
    }

    const email = await getVerifiedCustomerEmail(request);
    if (!(await checkRateLimit(request, "order-service-request-email", 5, 3600, email))) {
      return json({ error: "Too many order requests. Please try again later." }, 429, request);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON." }, 400, request);
    }
    if (!body || typeof body !== "object") {
      return json({ error: "Order request details are invalid." }, 400, request);
    }
    const input = body as Record<string, unknown>;
    const orderNumber = typeof input.orderNumber === "string" ? input.orderNumber.trim() : "";
    const type = input.type;
    const note = typeof input.note === "string" ? input.note.trim() : "";
    if (
      !/^LH-[A-Z0-9]{8}$/.test(orderNumber) ||
      (type !== "cancellation" && type !== "return") ||
      note.length < 10 ||
      note.length > 1000
    ) {
      return json(
        { error: "Enter a valid order, request type and reason (10–1,000 characters)." },
        400,
        request,
      );
    }

    const { url, headers } = serviceHeaders();
    const response = await fetch(`${url}/rest/v1/rpc/submit_order_service_request`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        p_order_number: orderNumber,
        p_customer_email: email,
        p_request_type: type,
        p_note: note,
      }),
    });
    if (!response.ok) {
      console.error("Unable to submit order service request.", response.status, await response.text());
      throw new Error("Unable to submit your request. Please try again.");
    }
    const submitted: unknown = await response.json();
    if (submitted !== true) {
      return json(
        { error: "This order is not eligible for that request, or it already has a request awaiting review." },
        409,
        request,
      );
    }
    return json({ submitted: true }, 200, request);
  } catch (error) {
    console.error("Unable to process order service request.", error);
    const status =
      error instanceof RateLimitServiceError
        ? 503
        : error instanceof OrderAuthenticationError
          ? 401
          : 500;
    return json(
      { error: error instanceof Error ? error.message : "Unable to submit your request." },
      status,
      request,
    );
  }
});
