import { json, markPaymentAbandoned, preflight } from "../_shared/orders.ts";
import { checkRateLimit, rejectDisallowedOrigin, RateLimitServiceError } from "../_shared/security.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  const blocked = rejectDisallowedOrigin(request);
  if (blocked) return blocked;
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, request);

  try {
    if (!(await checkRateLimit(request, "abandon-razorpay-order", 20, 900))) {
      return json({ error: "Too many requests. Please try again later." }, 429, request);
    }
    const body = (await request.json()) as Record<string, unknown> | null;
    const razorpayOrderId = typeof body?.razorpayOrderId === "string" ? body.razorpayOrderId : "";
    const abandonmentToken =
      typeof body?.abandonmentToken === "string" ? body.abandonmentToken : "";

    if (
      !razorpayOrderId ||
      !abandonmentToken ||
      !/^order_[A-Za-z0-9]+$/.test(razorpayOrderId) ||
      !/^[a-fA-F0-9]{64}$/.test(abandonmentToken)
    ) {
      return json({ error: "Payment cancellation details are invalid." }, 400, request);
    }

    const abandoned = await markPaymentAbandoned(razorpayOrderId, abandonmentToken);
    return json({ abandoned }, 200, request);
  } catch (error) {
    console.error("Unable to abandon Razorpay order.", error);
    return json(
      { error: error instanceof Error ? error.message : "Unable to update payment status." },
      error instanceof RateLimitServiceError ? 503 : 500,
      request,
    );
  }
});
