import { checkRateLimit, corsHeaders, preflight, rejectDisallowedOrigin, RateLimitServiceError } from "../_shared/security.ts";

function json(body: unknown, status: number, request: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json" },
  });
}

async function updateWelcomeStatus(email: string, values: Record<string, unknown>) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Newsletter storage is not configured on the server.");
  const params = new URLSearchParams({ email: `eq.${email}` });
  const response = await fetch(`${url}/rest/v1/newsletter_subscribers?${params}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(values),
  });
  if (!response.ok) {
    console.error("Unable to update newsletter welcome status.", response.status, await response.text());
    throw new Error("Unable to update newsletter subscription status.");
  }
}

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  const blocked = rejectDisallowedOrigin(request);
  if (blocked) return blocked;
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, request);
  }

  try {
    if (!(await checkRateLimit(request, "newsletter-ip", 5, 3600))) {
      return json({ error: "Too many signup attempts. Please try again later." }, 429, request);
    }

    const body: unknown = await request.json();
    const emailValue =
      body && typeof body === "object" && "email" in body ? body.email : undefined;
    if (
      typeof emailValue !== "string" ||
      emailValue.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())
    ) {
      return json({ error: "Please enter a valid email address." }, 400, request);
    }
    const email = emailValue.trim().toLowerCase();
    if (!(await checkRateLimit(request, "newsletter-email", 1, 3600, email))) {
      return json({ subscribed: true }, 200, request);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Newsletter storage is not configured on the server.");

    const claimResponse = await fetch(`${url}/rest/v1/rpc/claim_newsletter_welcome`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_email: email }),
    });
    if (!claimResponse.ok) {
      console.error("Unable to subscribe newsletter email.", claimResponse.status, await claimResponse.text());
      throw new Error("Unable to save your subscription. Please try again.");
    }
    const claimed: unknown = await claimResponse.json();
    if (claimed !== true) return json({ subscribed: true }, 200, request);

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("ORDER_FROM_EMAIL");
    if (!apiKey || !from) {
      await updateWelcomeStatus(email, { welcome_claimed_at: null });
      throw new Error("Newsletter email is not configured on the server.");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Welcome to LOUIE HERITAGE",
        html: "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111\"><h1>Welcome to LOUIE HERITAGE.</h1><p>Thank you for joining our newsletter. We look forward to sharing considered pieces, new collections and studio notes with you.</p><p>LOUIE HERITAGE</p></div>",
        text: "Welcome to LOUIE HERITAGE. Thank you for joining our newsletter. We look forward to sharing considered pieces, new collections and studio notes with you.",
      }),
    });
    if (!emailResponse.ok) {
      console.error("Resend rejected newsletter welcome.", emailResponse.status, await emailResponse.text());
      await updateWelcomeStatus(email, { welcome_claimed_at: null });
      return json({ error: "Your signup could not be completed. Please try again later." }, 502, request);
    }

    await updateWelcomeStatus(email, {
      welcome_claimed_at: null,
      welcome_sent_at: new Date().toISOString(),
    });
    return json({ subscribed: true }, 200, request);
  } catch (error) {
    console.error("Unable to process newsletter subscription.", error);
    const status = error instanceof RateLimitServiceError ? 503 : 500;
    return json(
      { error: error instanceof Error ? error.message : "Unable to subscribe. Please try again." },
      status,
      request,
    );
  }
});
