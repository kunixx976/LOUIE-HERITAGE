# Louie Heritage

Everyday clothing, accessories and home textiles. This repository is the storefront: a minimal, editorial e-commerce site with a neutral palette, generous whitespace and subtle motion.

**Live site:** https://modern-heirloom.vercel.app

Business identity, sourcing, contact information, tax details, delivery estimates and return or warranty terms have not been independently verified. Do not treat earlier storefront claims as confirmed. Delivery charges are calculated at checkout; confirm the configured rates with the seller before accepting live orders.

## Features

**Storefront**

- Landing page with a hero, promo tiles, featured products, new arrivals, seasonal edits and a social gallery
- Mega menu covering Women, Men, T-Shirts, Denim, Ethnic Wear, Woollens, Home Textiles, Casual, Accessories, Summer and Winter
- Shop page with category, size, price and availability filters and pagination
- Product cards with discount and "New" badges, quick view and add to bag

**Account and purchase**

- Cart, wishlist and profile (dashboard, orders, wishlist, addresses, settings)
- Checkout, order tracking, contact, about and FAQ pages

**Status:** the project is in progress. See [CHECKLIST.md](./CHECKLIST.md) for what's finished and what's left.

## Design system

| Token          | Hex       |
| -------------- | --------- |
| Background     | `#FAFAF8` |
| Primary text   | `#111111` |
| Secondary text | `#666666` |
| Borders        | `#E8E8E8` |
| Accent         | `#000000` |
| Hover accent   | `#444444` |

- **Type:** Playfair Display for headings, Inter for body text
- **Layout:** 12-column grid, mobile-first, 8–12px radii, shadows only where needed
- **Motion:** fade-ins and small hover transitions only

## Tech stack

Built with React, TypeScript, Tailwind CSS, TanStack Start and Vite. The project is connected to Lovable and deployed on Vercel.

## Getting started

Requires Node.js and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone https://github.com/kunixx976/modern-heirloom.git
cd modern-heirloom
npm install
npm run dev
```

## Google sign-in

Google sign-in uses Supabase Auth. Set `VITE_SITE_URL` in Vercel to the deployed
site's canonical URL (for example, `https://your-production-domain.vercel.app`),
then redeploy. The app uses that origin for Google sign-in, signup confirmation,
and password-reset callbacks; local development falls back to its current origin.

In the Supabase dashboard, enable Google under **Authentication → Providers**
and add your Google OAuth client credentials. Under **Authentication → URL
Configuration**, set **Site URL** to the same deployed URL and add these paths
to **Redirect URLs**:

```text
https://your-production-domain.vercel.app/profile
https://your-production-domain.vercel.app/forgot-password
```

In Google Cloud Console, add the Supabase callback URL shown in the Google
provider settings as an authorized redirect URI. It is the Supabase callback
URL, not the Vercel URL.

## Payments and order confirmation emails

Checkout supports online payments through Razorpay (UPI, Visa, Mastercard, RuPay and net banking)
and cash on delivery. Orders are stored in Supabase, with confirmation email through Resend. The
integration is not live until the following setup is complete. Start with Razorpay test-mode keys
and test orders before enabling live payments.

1. Create Razorpay and Resend accounts. In Razorpay, enable UPI, cards and net banking, then copy
   the **test** Key ID and Key Secret. Visa, Mastercard and RuPay are accepted through card
   payments when enabled for the Razorpay account. In Resend, verify a sending domain and choose
   an address on that domain for order emails.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) if needed, then link this
   repository to the Supabase project used by the storefront:

   ```sh
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push --remote
   ```

   The migrations create the private `public.orders` table and payment/tracking fields, plus the
   public-read `products` and `product_variants` catalog, and the per-user `customer_shop_data`
   table for carts, wishlists and saved addresses. Row-level security restricts customer data to its
   owner; order data is accessed by Edge Functions using the server-side service role.

3. Add credentials as Supabase Edge Function secrets (never as `VITE_` variables or in browser
   code):

   ```sh
   npx supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx RAZORPAY_WEBHOOK_SECRET=xxx RESEND_API_KEY=re_xxx "ORDER_FROM_EMAIL=LOUIE HERITAGE <orders@your-verified-domain>"
   ```

   Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions.
   The production origin defaults to `https://modern-heirloom.vercel.app`. Set
   `ALLOWED_ORIGINS` to a comma-separated list of exact storefront origins if the site uses a
   different domain; add local development origins only for local testing. Do not share or commit
   any secret keys.

4. Deploy the checkout functions:

   ```sh
   npx supabase functions deploy create-razorpay-order
   npx supabase functions deploy verify-razorpay-payment
   npx supabase functions deploy create-cod-order
   npx supabase functions deploy subscribe-newsletter
   npx supabase functions deploy list-orders
   npx supabase functions deploy abandon-razorpay-order
   npx supabase functions deploy razorpay-webhook --no-verify-jwt
   ```

5. In Razorpay **Account & Settings → Webhooks**, add
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook`, use the same webhook
   secret saved above, and subscribe to `payment.captured` and `payment.failed`.
6. Keep Razorpay in test mode and verify successful UPI, card and net-banking payments, failed
   payment, closed payment window, COD order, confirmation email, verified-customer order history
   and tracking details.
   Do not switch to live credentials until these flows pass and the seller's business, tax,
   shipping, return and warranty details have been confirmed.

Order history is limited to the signed-in customer's verified email. Carrier and tracking details
are optional order fields and appear after they have been supplied. Cookie preferences can be
changed from the privacy policy; no optional analytics integration is currently active.

The Razorpay secret, Resend API key and Supabase service-role key must stay in Supabase secrets.
The browser only receives Razorpay's public Key ID and a one-time payment-abandonment token from
the order-creation function. If function deployment or secrets are missing, checkout displays an
error and does not create a successful order in the storefront.

COD and Razorpay order creation, payment verification, order history and newsletter signups use
database-backed rate limits. The order endpoints accept browser requests only from the configured
storefront origins. The newsletter stores subscriber email addresses in a private Supabase table
and sends a welcome email through Resend using the configured `RESEND_API_KEY` and
`ORDER_FROM_EMAIL`.

## Product prices and inventory

Product prices, active status, sizes, colours and per-variant stock are read from the Supabase
`products` and `product_variants` tables. Apply migrations with `npx supabase db push`, then manage
prices, available variants and `stock_count` in the Supabase Table Editor; checkout checks those
values on the server for every order. Product images, descriptions and category presentation remain
in the storefront source, so adding a completely new displayed product still requires a code
update.
