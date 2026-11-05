import {
  getCheckoutDetails,
  hashPaymentToken,
  json,
  preflight,
  razorpayCredentials,
  readCheckout,
  saveOrder,
} from "../_shared/orders.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const checkout = await readCheckout(request);
    const { keyId, keySecret } = razorpayCredentials();
    const abandonmentToken = [...crypto.getRandomValues(new Uint8Array(32))]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: checkout.total * 100,
        currency: "INR",
        receipt: checkout.orderNumber,
        notes: { order_number: checkout.orderNumber },
      }),
    });
    const razorpayOrder = await razorpayResponse.json();
    if (!razorpayResponse.ok) {
      console.error("Razorpay order creation failed.", razorpayOrder);
      return json({ error: "Unable to start payment. Please try again." }, 502);
    }

    await saveOrder({
      order_number: checkout.orderNumber,
      ...getCheckoutDetails(checkout.input, checkout.items),
      subtotal: checkout.subtotal,
      discount: checkout.discount,
      shipping_fee: checkout.shippingFee,
      total: checkout.total,
      payment_method: "razorpay",
      payment_status: "pending",
      status: "Awaiting payment",
      razorpay_order_id: razorpayOrder.id,
      abandonment_token_hash: await hashPaymentToken(abandonmentToken),
    });

    return json({
      orderNumber: checkout.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: checkout.total * 100,
      currency: "INR",
      keyId,
      abandonmentToken,
    });
  } catch (error) {
    console.error("Unable to create Razorpay order.", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unable to start payment.",
      },
      400,
    );
  }
});
