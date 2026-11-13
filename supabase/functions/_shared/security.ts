declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const defaultAllowedOrigins = ["https://modern-heirloom.vercel.app"];

export class RateLimitServiceError extends Error {}

function allowedOrigins() {
  const configured = Deno.env.get("ALLOWED_ORIGINS");
  return configured
    ? configured.split(",").map((origin) => origin.trim()).filter(Boolean)
    : defaultAllowedOrigins;
}

function isAllowedOrigin(origin: string) {
  return allowedOrigins().includes(origin);
}

export function rejectDisallowedOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin || isAllowedOrigin(origin)) return null;
  return new Response(JSON.stringify({ error: "Origin is not allowed." }), {
    status: 403,
    headers: { "Content-Type": "application/json", Vary: "Origin" },
  });
}

export function preflight(request: Request) {
  if (request.method !== "OPTIONS") return null;
  const rejected = rejectDisallowedOrigin(request);
  if (rejected) return rejected;
  const origin = request.headers.get("Origin");
  return new Response("ok", {
    headers: {
      ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    },
  });
}

export function corsHeaders(request?: Request) {
  const origin = request?.headers.get("Origin");
  return {
    ...(origin && isAllowedOrigin(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export async function checkRateLimit(
  request: Request,
  action: string,
  limit: number,
  windowSeconds: number,
  identity = "",
) {
  const ip =
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip || ip.length > 100) {
    throw new RateLimitServiceError("Unable to determine request origin for rate limiting.");
  }

  const digest = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${action}:${ip}:${identity}`),
    ),
  );
  const bucket = [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new RateLimitServiceError("Rate limiting is not configured on the server.");
  }

  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/rpc/consume_api_rate_limit`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_bucket: bucket,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      }),
    });
  } catch (error) {
    console.error("Unable to reach request rate-limit service.", error);
    throw new RateLimitServiceError("Rate limiting is temporarily unavailable.");
  }
  if (!response.ok) {
    console.error("Unable to check request rate limit.", response.status, await response.text());
    throw new RateLimitServiceError("Rate limiting is temporarily unavailable.");
  }
  let allowed: unknown;
  try {
    allowed = await response.json();
  } catch (error) {
    console.error("Unable to read request rate-limit response.", error);
    throw new RateLimitServiceError("Rate limiting returned an invalid response.");
  }
  if (typeof allowed !== "boolean") {
    throw new RateLimitServiceError("Rate limiting returned an invalid response.");
  }
  return allowed;
}
