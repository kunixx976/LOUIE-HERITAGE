# curated closet

Build a premium, modern e-commerce clothing website that feels handcrafted by an experienced UI/UX designer. Avoid generic AI-generated layouts, oversized gradients, glassmorphism, neon colors, floating cards everywhere, or excessive animations.

Brand Style:

- Luxury minimalism similar to COS, Zara, Arket, Aime Leon Dore, and Uniqlo.

- Lots of whitespace.

- Clean typography.

- Neutral color palette.

- Editorial fashion aesthetic.

- Premium photography.

- Focus on simplicity and usability.

Color Palette:

Background: #FAFAF8

Primary Text: #111111

Secondary Text: #666666

Borders: #E8E8E8

Accent: #000000

Hover Accent: #444444

Typography:

- Headings: Playfair Display

- Body: Inter

- Large elegant headings.

- Comfortable spacing.

- Minimal font weights.

Tech Stack:

- React

- Next.js

- Tailwind CSS

- Framer Motion (subtle only)

- TypeScript

- Responsive design

- Clean reusable components

Pages:

1. Landing Page

2. Shop

3. Category Page

4. Product Detail

5. Cart

6. Wishlist

7. Checkout

8. Login / Signup

9. User Profile

10. Order History

11. Contact

12. About

13. FAQ

14. Privacy Policy

15. Terms & Conditions

Landing Page Sections:

- Transparent navbar that becomes solid on scroll.

- Full-width hero image with elegant headline.

- "Shop Women"

- "Shop Men"

- "New Collection"

- Featured categories.

- Best Sellers.

- New Arrivals.

- Seasonal Collection.

- Editorial banner.

- Customer reviews.

- Instagram-inspired gallery.

- Newsletter signup.

- Minimal footer.

Navbar:

- Logo centered.

- Search.

- Wishlist icon.

- Cart icon.

- User account.

- Mega menu for categories.

- Sticky navigation.

Categories:

Women

Men

Oversized

Streetwear

Casual

Formal

Summer

Winter

Accessories

Shoes

Shop Page:

- Left sidebar filters.

- Category filter.

- Size filter.

- Color filter.

- Price slider.

- Availability.

- Sorting.

- Responsive product grid.

- Pagination.

Product Card:

- Large image.

- Hover swaps image.

- Product name.

- Price.

- Discount badge.

- Favorite icon.

- Quick View button.

- Add to Cart button.

- Smooth hover effects only.

Product Page:

Large image gallery.

Zoom on hover.

Thumbnail images.

Product details.

Size selector.

Color selector.

Quantity selector.

Size guide.

Delivery information.

Returns policy.

Add to Cart.

Wishlist.

Related products.

Recently viewed.

Customer reviews.

Ratings.

Cart:

Minimal layout.

Coupon field.

Shipping estimate.

Order summary.

Recommended products.

Checkout:

Multi-step checkout.

Shipping.

Payment.

Review.

Success page.

Guest checkout.

Address management.

Authentication:

Elegant login.

Register.

Forgot password.

Google login placeholder.

Profile:

Dashboard.

Orders.

Wishlist.

Addresses.

Settings.

Animations:

Keep animations subtle.

Fade-in.

Small hover transitions.

Micro interactions.

No excessive motion.

Design Rules:

- Every section should breathe with generous spacing.

- Use a consistent 12-column grid.

- Rounded corners only where appropriate (8-12px).

- Soft shadows only when necessary.

- Avoid loud colors.

- Prioritize readability.

- Use realistic fashion photography placeholders.

- Use proper spacing between sections.

- Premium editorial feel.

- Pixel-perfect alignment.

- Mobile-first responsive design.

Components:

Reusable:

- Buttons

- Cards

- Inputs

- Dropdowns

- Badges

- Modals

- Drawers

- Breadcrumbs

- Tabs

- Accordions

- Toast notifications

- Skeleton loaders

Footer:

Newsletter.

Quick links.

Customer support.

Policies.

Social icons.

Payment methods.

Performance:

- Lazy loading images.

- Optimized components.

- Accessible design (WCAG).

- SEO-friendly.

- Semantic HTML.

- Fast loading.

Do not generate placeholder Lorem Ipsum. Use realistic fashion-focused copy throughout.

The final result should look like a professionally designed fashion brand website rather than an AI-generated template. Every page should have consistent spacing, typography, and visual hierarchy with attention to premium details.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://modern-heirloom.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/52bfbbb0-755e-4368-ba01-fd1c8ae31eb2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Authentication

Login, registration, and password reset use Supabase Auth. Create a Supabase project,
enable email authentication, and add the project URL and anon key to a local `.env`
file using [.env.example](./.env.example) as a template. These `VITE_` values are
public client configuration; never put a service-role key in the app.

In Supabase Authentication URL Configuration, allow the app's origin and the
`/profile` and `/forgot-password` redirect URLs. Email confirmation can be enabled
in the Supabase authentication settings. The registration form stores the submitted
name in the authenticated user's `full_name` metadata.
