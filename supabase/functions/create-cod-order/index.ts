import {
  getCheckoutDetails,
  json,
  markEmailSent,
  preflight,
  readCheckout,
  saveOrder,
  sendOrderConfirmation,
} from "../_shared/orders.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const checkout = await readCheckout(request);
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
    return json({ orderNumber: checkout.orderNumber, emailSent, total: checkout.total });
  } catch (error) {
    console.error("Unable to place COD order.", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unable to place your order.",
      },
      400,
    );
  }
});
