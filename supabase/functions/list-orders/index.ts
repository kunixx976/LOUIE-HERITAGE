import {
  getVerifiedCustomerEmail,
  json,
  listCustomerOrders,
  OrderAuthenticationError,
  preflight,
} from "../_shared/orders.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const email = await getVerifiedCustomerEmail(request);
    const orders = await listCustomerOrders(email);
    return json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load your orders.";
    console.error("Unable to list customer orders.", error);
    return json({ error: message }, error instanceof OrderAuthenticationError ? 401 : 500);
  }
});
