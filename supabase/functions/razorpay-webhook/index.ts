import { finalizePaidOrder, json, markPaymentFailed } from "../_shared/orders.ts";

async function validSignature(body: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
  );
  const expected = [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (signature.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  }
  return mismatch === 0;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    if (!secret || !signature) return json({ error: "Webhook is not configured." }, 401);

    const rawBody = await request.text();
    if (!(await validSignature(rawBody, signature, secret))) {
      return json({ error: "Invalid webhook signature." }, 401);
    }

    const event = JSON.parse(rawBody);
    const payment = event.payload?.payment?.entity;
    if (event.event === "payment.failed") {
      if (
        !payment ||
        typeof payment.order_id !== "string" ||
        typeof payment.id !== "string" ||
        payment.status !== "failed"
      ) {
        return json({ error: "Invalid failed-payment event." }, 400);
      }
      await markPaymentFailed(payment.order_id, payment.id);
      return json({ received: true });
    }
    if (event.event !== "payment.captured") return json({ received: true });

    if (
      !payment ||
      typeof payment.order_id !== "string" ||
      typeof payment.id !== "string" ||
      payment.status !== "captured" ||
      payment.captured !== true ||
      payment.method !== "upi"
    ) {
      return json({ error: "Invalid captured-payment event." }, 400);
    }

    const result = await finalizePaidOrder(
      payment.order_id,
      payment.id,
      payment.amount,
      payment.currency,
    );
    if (!result) return json({ error: "Order not found." }, 404);
    if (!result.emailSent) {
      return json(
        { error: "Order confirmed, but the confirmation email has not been sent yet." },
        503,
      );
    }
    return json({ received: true, orderNumber: result.orderNumber });
  } catch (error) {
    console.error("Unable to process Razorpay webhook.", error);
    return json({ error: "Webhook processing failed." }, 500);
  }
});
