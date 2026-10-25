# Louie Heritage

Everyday cotton, denim and ethnic wear, bought directly from India's textile hubs and shipped from Meerut, Uttar Pradesh. This repository is the storefront: a minimal, editorial e-commerce site with a neutral palette, generous whitespace and subtle motion.

**Live site:** https://modern-heirloom.vercel.app

## The brand

Louie Heritage sources straight from the mills, with no middlemen:

| Product | Source |
| --- | --- |
| Cotton tees | Tirupur |
| Denim | Ahmedabad, Bhilwara |
| Sarees and kurta sets | Surat |
| Woollens | Ludhiana |
| Home textiles | Panipat |

Prices are in INR (₹). Free delivery on orders over ₹1,499. Payments: UPI, Visa, Mastercard, RuPay, net banking and cash on delivery.

## Features

**Storefront**
- Landing page with a hero, promo tiles, 11 featured categories, best sellers, new arrivals, a winter edit, a sourcing story, customer notes, a social gallery and a newsletter signup
- Mega menu covering Women, Men, T-Shirts, Denim, Ethnic Wear, Woollens, Home Textiles, Casual, Accessories, Summer and Winter
- Shop page with category, size, price and availability filters and pagination
- Product cards with discount and "New" badges, quick view and add to bag

**Account and purchase**
- Cart, wishlist and profile (dashboard, orders, wishlist, addresses, settings)
- Checkout, order tracking, contact, about and FAQ pages

**Status:** the project is in progress. See [CHECKLIST.md](./CHECKLIST.md) for what's finished and what's left.

## Design system

| Token | Hex |
| --- | --- |
| Background | `#FAFAF8` |
| Primary text | `#111111` |
| Secondary text | `#666666` |
| Borders | `#E8E8E8` |
| Accent | `#000000` |
| Hover accent | `#444444` |

- **Type:** Playfair Display for headings, Inter for body text
- **Layout:** 12-column grid, mobile-first, 8–12px radii, shadows only where needed
- **Motion:** fade-ins and small hover transitions only

## Tech stack

Built with [Lovable](https://lovable.dev) using React, TypeScript, Tailwind CSS and Framer Motion, and deployed on Vercel.

> Confirm the framework and bundler against `package.json` and update this section (Vite vs Next.js affects the dev URL and scripts).

## Getting started

Requires Node.js and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone https://github.com/kunixx976/modern-heirloom.git
cd modern-heirloom
npm install
npm run dev
```
