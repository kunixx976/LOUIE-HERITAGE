import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";

const shop = [
  { label: "New arrivals", to: "/shop" as const },
  { label: "Women", slug: "women" },
  { label: "Men", slug: "men" },
  { label: "Accessories", slug: "accessories" },
  { label: "Shoes", slug: "shoes" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-editorial">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-12 md:gap-12 md:py-20">
          <div className="col-span-2 md:col-span-4">
            <p className="font-display text-lg uppercase tracking-[0.28em]">Atelier Nord</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Considered clothing made in limited runs from natural fibres. Designed in
              Copenhagen, made in Europe.
            </p>
            <div className="mt-8">
              <p className="eyebrow mb-3">Collection previews & studio notes</p>
              <NewsletterForm />
            </div>
          </div>

          <nav className="md:col-span-2" aria-label="Shop">
            <p className="eyebrow mb-4">Shop</p>
            <ul className="space-y-0.5 text-sm text-muted-foreground [&_a]:inline-block [&_a]:py-2.5 md:space-y-2.5 md:[&_a]:py-0">
              {shop.map((item) =>
                item.slug ? (
                  <li key={item.label}>
                    <Link
                      to="/category/$slug"
                      params={{ slug: item.slug }}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ) : (
                  <li key={item.label}>
                    <Link to="/shop" className="transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-label="Customer care">
            <p className="eyebrow mb-4">Customer care</p>
            <ul className="space-y-0.5 text-sm text-muted-foreground [&_a]:inline-block [&_a]:py-2.5 md:space-y-2.5 md:[&_a]:py-0">
              <li>
                <Link to="/contact" className="transition-colors hover:text-foreground">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-foreground">
                  Shipping & returns
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-foreground">
                  Size guide
                </Link>
              </li>
              <li>
                <Link to="/orders" className="transition-colors hover:text-foreground">
                  Track an order
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-label="Company">
            <p className="eyebrow mb-4">Company</p>
            <ul className="space-y-0.5 text-sm text-muted-foreground [&_a]:inline-block [&_a]:py-2.5 md:space-y-2.5 md:[&_a]:py-0">
              <li>
                <Link to="/about" className="transition-colors hover:text-foreground">
                  Our story
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-foreground">
                  Materials
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-foreground">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition-colors hover:text-foreground">
                  Terms & conditions
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className="eyebrow mb-4">Follow</p>
            <div className="-ml-3 flex text-muted-foreground md:ml-0 md:gap-4">
              <a href="https://instagram.com" aria-label="Instagram" className="grid h-11 w-11 place-items-center transition-colors hover:text-foreground md:h-auto md:w-auto">
                <Instagram className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" className="grid h-11 w-11 place-items-center transition-colors hover:text-foreground md:h-auto md:w-auto">
                <Facebook className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </a>
              <a href="https://youtube.com" aria-label="YouTube" className="grid h-11 w-11 place-items-center transition-colors hover:text-foreground md:h-auto md:w-auto">
                <Youtube className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </a>
            </div>
            <p className="eyebrow mb-3 mt-8">We accept</p>
            <div className="flex flex-wrap gap-1.5">
              {["Visa", "Mastercard", "Amex", "PayPal", "Klarna"].map((m) => (
                <span
                  key={m}
                  className="rounded-[4px] border border-border px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-7 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Atelier Nord ApS. All rights reserved.</p>
          <div className="flex gap-6 [&_a]:inline-block [&_a]:py-1 md:[&_a]:py-0">
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <span>Copenhagen, Denmark</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
