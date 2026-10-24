# Curated Closet

A modern, editorial e-commerce storefront for a clothing brand, designed in the spirit of luxury minimalism (think COS, Arket, Aimé Leon Dore, Uniqlo): generous whitespace, restrained typography, a neutral palette and subtle motion.

**Live app:** https://modern-heirloom.lovable.app

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React + Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion (fade-ins and small hover transitions only) |
| Built with | [Lovable](https://lovable.dev) |

## Design system

**Colors**

| Token | Hex |
| --- | --- |
| Background | `#FAFAF8` |
| Primary text | `#111111` |
| Secondary text | `#666666` |
| Borders | `#E8E8E8` |
| Accent | `#000000` |
| Hover accent | `#444444` |

**Typography:** Playfair Display for headings, Inter for body text, with minimal font weights and comfortable spacing.

**Layout rules**
- Consistent 12-column grid, mobile-first
- Generous spacing between sections
- Rounded corners of 8–12px only where appropriate; soft shadows only when necessary
- No loud colors, gradients or glassmorphism

## Pages

| Area | Pages |
| --- | --- |
| Storefront | Landing, Shop, Category, Product Detail |
| Purchase flow | Cart, Wishlist, Checkout (Shipping → Payment → Review → Success) |
| Account | Login / Signup, User Profile, Order History |
| Info | Contact, About, FAQ, Privacy Policy, Terms & Conditions |

### Landing page
Transparent navbar that turns solid on scroll, full-width hero with Shop Women / Shop Men / New Collection calls to action, featured categories, Best Sellers, New Arrivals, a seasonal collection, an editorial banner, customer reviews, an Instagram-style gallery, newsletter signup and a minimal footer.

### Navigation
Centered logo, search, wishlist, cart and account icons, a sticky bar and a mega menu covering: Women, Men, Oversized, Streetwear, Casual, Formal, Summer, Winter, Accessories and Shoes.

### Shop
Left sidebar filters (category, size, color, price slider, availability), sorting, a responsive product grid and pagination.

### Product card
Large image that swaps on hover, name, price, discount badge, favorite icon, Quick View and Add to Cart.

### Product page
Image gallery with thumbnails and zoom on hover, size / color / quantity selectors, size guide, delivery and returns information, wishlist, related products, recently viewed, ratings and reviews.

### Cart and checkout
Minimal cart with coupon field, shipping estimate, order summary and recommendations. Multi-step checkout with guest checkout and address management.

### Authentication and profile
Login, register, forgot password and a Google login placeholder. Profile sections: dashboard, orders, wishlist, addresses and settings.

## Reusable components

Buttons, cards, inputs, dropdowns, badges, modals, drawers, breadcrumbs, tabs, accordions, toast notifications and skeleton loaders.

## Performance and accessibility

- Lazy-loaded images
- Semantic HTML and SEO-friendly markup
- Built with WCAG accessibility in mind
- Subtle, non-blocking animation

## Getting started

**Prerequisites:** Node.js and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone https://github.com/kunixx976/modern-heirloom.git
cd modern-heirloom
npm install
npm run dev
```

Then open the local URL printed in the terminal (usually `http://localhost:3000` or `http://localhost:5173`).
