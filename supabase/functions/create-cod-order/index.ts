import {
  getCheckoutDetails,
  json,
  markEmailSent,
  preflight,
  readCheckout,
  saveOrder,
  sendOrderConfirmation,
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
    if (!(await checkRateLimit(request, "create-cod-order-ip", 10, 3600))) {
      return json({ error: "Too many order attempts. Please try again later." }, 429, request);
    }
    const checkout = await readCheckout(request);
    if (
      !(await checkRateLimit(
        request,
        "create-cod-order-email",
        3,
        3600,
        checkout.input.email.toLowerCase(),
      ))
    ) {
      return json({ error: "Too many orders for this email. Please try again later." }, 429, request);
    }
    await saveOrder({
      order_number: checkout.orderNumber,
      ...getCheckoutDetails(checkout.input, checkout.items),
      subtotal: checkout.subtotal,
      discount: checkout.discount,
      shipping_fee: checkout.shippingFee,
      total: checkout.total,
      payment_method: "cod",
      payment_status: "cod_due",
      status: "Processing",
    });
    const emailSent = await sendOrderConfirmation({
      orderNumber: checkout.orderNumber,
      email: checkout.input.email,
      name: checkout.input.name,
      items: checkout.items,
      subtotal: checkout.subtotal,
      discount: checkout.discount,
      shippingFee: checkout.shippingFee,
      total: checkout.total,
      method: "cod",
      address: checkout.input,
    });
    if (emailSent) await markEmailSent(checkout.orderNumber);
    return json({ orderNumber: checkout.orderNumber, emailSent, total: checkout.total }, 200, request);
  } catch (error) {
    console.error("Unable to place COD order.", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unable to place your order.",
      },
      error instanceof RateLimitServiceError ? 503 : 400,
      request,
    );
  }
});
