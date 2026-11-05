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

Google sign-in uses Supabase Auth. In your Supabase dashboard, enable the Google
provider under **Authentication → Providers** and add your Google OAuth client
credentials. In **Authentication → URL Configuration**, allow your app's origin
and set the Supabase callback URL listed in the Google provider settings as an
authorized redirect URI in Google Cloud Console.

## Payments and order confirmation emails

Checkout uses Razorpay for UPI and card payments, supports cash on delivery, stores orders in
Supabase, and sends confirmation email through Resend. The integration is not live until the
following setup is complete. Start with Razorpay test-mode keys and test orders before enabling
live payments.

1. Create Razorpay and Resend accounts. In Razorpay, enable UPI and cards and copy the **test**
   Key ID and Key Secret. In Resend, verify a sending domain and choose an address on that domain
   for order emails.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) if needed, then link this
   repository to the Supabase project used by the storefront:

   ```sh
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

   The migrations create the private `public.orders` table and payment/tracking fields. Row-level
   security is enabled; order data is accessed by Edge Functions using the server-side service role.

3. Add credentials as Supabase Edge Function secrets (never as `VITE_` variables or in browser
   code):

   ```sh
   npx supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx RAZORPAY_WEBHOOK_SECRET=xxx RESEND_API_KEY=re_xxx "ORDER_FROM_EMAIL=LOUIE HERITAGE <orders@your-verified-domain>"
   ```

   Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions.
   Do not share or commit any secret keys.

4. Deploy the checkout functions:

   ```sh
   npx supabase functions deploy create-razorpay-order
   npx supabase functions deploy verify-razorpay-payment
   npx supabase functions deploy create-cod-order
   npx supabase functions deploy list-orders
   npx supabase functions deploy abandon-razorpay-order
   npx supabase functions deploy razorpay-webhook --no-verify-jwt
   ```

5. In Razorpay **Account & Settings → Webhooks**, add
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook`, use the same webhook
   secret saved above, and subscribe to `payment.captured` and `payment.failed`.
6. Keep Razorpay in test mode and verify successful payment, failed payment, closed payment
   window, COD order, confirmation email, verified-customer order history and tracking details.
   Do not switch to live credentials until these flows pass and the seller's business, tax,
   shipping, return and warranty details have been confirmed.

Order history is limited to the signed-in customer's verified email. Carrier and tracking details
are optional order fields and appear after they have been supplied. Cookie preferences can be
changed from the privacy policy; no optional analytics integration is currently active.

The Razorpay secret, Resend API key and Supabase service-role key must stay in Supabase secrets.
The browser only receives Razorpay's public Key ID and a one-time payment-abandonment token from
the order-creation function. If function deployment or secrets are missing, checkout displays an
error and does not create a successful order in the storefront.
