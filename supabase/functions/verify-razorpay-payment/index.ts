import {
  finalizePaidOrder,
  json,
  preflight,
  razorpayCredentials,
  validateOrderPayment,
} from "../_shared/orders.ts";

async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${orderId}|${paymentId}`)),
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
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const body = await request.json();
    const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
    const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
    const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";
    if (!orderId || !paymentId || !signature) {
      return json({ error: "Payment verification details are incomplete." }, 400);
    }

    const { keyId, keySecret } = razorpayCredentials();
    if (!(await verifySignature(orderId, paymentId, signature, keySecret))) {
      return json(
        { error: "Payment verification failed. If you were charged, check order history." },
        400,
      );
    }

    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` } },
    );
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok || payment.order_id !== orderId || payment.currency !== "INR") {
      console.error("Razorpay payment details did not match the order.", payment);
      return json({ error: "Payment details did not match this order." }, 400);
    }
    if (!["upi", "card", "netbanking"].includes(payment.method)) {
      return json(
        { error: "This order accepts UPI, card or net banking payments only. If your account was charged, contact customer care with your payment ID." },
        400,
      );
    }

    if (!(await validateOrderPayment(orderId, payment.amount, payment.currency))) {
      return json({ error: "The order for this payment could not be found." }, 404);
    }

    if (payment.status === "authorized" && !payment.captured) {
      const captureResponse = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: payment.amount, currency: payment.currency }),
        },
      );
      const captured = await captureResponse.json();
      if (!captureResponse.ok || captured.status !== "captured" || !captured.captured) {
        console.error("Razorpay capture failed.", captured);
        return json(
          {
            error:
              "Payment is authorized but not yet captured. Check order history before trying again.",
          },
          502,
        );
      }
    } else if (payment.status !== "captured" || !payment.captured) {
      return json({ error: "Payment has not been captured." }, 400);
    }

    const result = await finalizePaidOrder(orderId, paymentId, payment.amount, payment.currency);
    if (!result) return json({ error: "The order for this payment could not be found." }, 404);
    return json(result);
  } catch (error) {
    console.error("Unable to verify Razorpay payment.", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unable to verify payment.",
      },
      500,
    );
  }
});
