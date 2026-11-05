import { json, markPaymentAbandoned, preflight } from "../_shared/orders.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const body = await request.json();
    if (
      typeof body.razorpayOrderId !== "string" ||
      typeof body.abandonmentToken !== "string" ||
      !/^order_[A-Za-z0-9]+$/.test(body.razorpayOrderId) ||
      !/^[a-f0-9]{64}$/.test(body.abandonmentToken)
    ) {
      return json({ error: "Payment cancellation details are invalid." }, 400);
    }

    const abandoned = await markPaymentAbandoned(body.razorpayOrderId, body.abandonmentToken);
    return json({ abandoned });
  } catch (error) {
    console.error("Unable to abandon Razorpay order.", error);
    return json(
      { error: error instanceof Error ? error.message : "Unable to update payment status." },
      500,
    );
  }
});
