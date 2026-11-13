import {
  getVerifiedCustomerEmail,
  json,
  listCustomerOrders,
  OrderAuthenticationError,
  preflight,
} from "../_shared/orders.ts";
import { checkRateLimit, rejectDisallowedOrigin, RateLimitServiceError } from "../_shared/security.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  const blocked = rejectDisallowedOrigin(request);
  if (blocked) return blocked;
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, request);

  try {
    if (!(await checkRateLimit(request, "list-customer-orders", 30, 900))) {
      return json({ error: "Too many requests. Please try again later." }, 429, request);
    }
    const email = await getVerifiedCustomerEmail(request);
    const orders = await listCustomerOrders(email);
    return json({ orders }, 200, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load your orders.";
    console.error("Unable to list customer orders.", error);
    return json(
      { error: message },
      error instanceof OrderAuthenticationError ? 401 : error instanceof RateLimitServiceError ? 503 : 500,
      request,
    );
  }
});
