import { useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { categories, products } from "@/lib/data";
import { formatPrice, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const groups = ["Collections", "Clothing", "Seasonal"] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { cartCount, wishlist, user, hydrated } = useShop();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categories.some((c) => c.includes(q)) ||
          p.fabric.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [query]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          transparent
            ? "border-b border-transparent bg-transparent text-background"
            : "border-b border-border bg-background/95 text-foreground backdrop-blur",
        )}
      >
        <div className="container-editorial">
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-[72px]">
            {/* Left — navigation */}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
              <MegaMenu label="Shop" transparent={transparent} />
              <Link to="/category/$slug" params={{ slug: "women" }} className="text-sm font-medium transition-colors hover:text-muted-foreground">
                Women
              </Link>
              <Link to="/category/$slug" params={{ slug: "men" }} className="text-sm font-medium transition-colors hover:text-muted-foreground">
                Men
              </Link>
              <Link to="/about" className="text-sm font-medium transition-colors hover:text-muted-foreground">
                About
              </Link>
            </nav>

            <div className="flex lg:hidden">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger aria-label="Open menu" className="-ml-3 grid h-11 w-11 place-items-center">
                  <Menu className="h-5 w-5" strokeWidth={1.25} />
                </SheetTrigger>

                <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto bg-background p-0">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <div className="px-6 pb-10 pt-8">
                    <p className="font-display text-xl">MishraClothings</p>
                    <div className="mt-8 space-y-8">
                      {groups.map((group) => (
                        <div key={group}>
                          <p className="eyebrow mb-3">{group}</p>
                          <ul className="space-y-3">
                            {categories
                              .filter((c) => c.group === group)
                              .map((c) => (
                                <li key={c.slug}>
                                  <Link
                                    to="/category/$slug"
                                    params={{ slug: c.slug }}
                                    onClick={() => setMenuOpen(false)}
                                    className="inline-block py-1 font-display text-lg"
                                  >
                                    {c.name}
                                  </Link>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}
                      <div className="space-y-1 border-t border-border pt-6 text-sm [&_a]:py-2">
                        <Link to="/shop" onClick={() => setMenuOpen(false)} className="block">
                          All products
                        </Link>
                        <Link to="/about" onClick={() => setMenuOpen(false)} className="block">
                          About
                        </Link>
                        <Link to="/contact" onClick={() => setMenuOpen(false)} className="block">
                          Contact
                        </Link>
                        <Link to="/profile" onClick={() => setMenuOpen(false)} className="block">
                          My account
                        </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Centre — logo */}
            <Link
              to="/"
              className="justify-self-center text-center font-display text-lg tracking-[0.1em] uppercase md:text-xl"
            >
              MishraAtelier&nbsp;Nordnbsp;Clothings
            </Link>

            {/* Right — utilities */}
            <div className="-mr-2.5 flex items-center justify-end md:-mr-2 md:gap-1">
              <button
                type="button"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="grid h-11 w-11 place-items-center transition-opacity hover:opacity-60"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </button>
              <Link to="/wishlist" aria-label="Wishlist" className="relative grid h-11 w-11 place-items-center transition-opacity hover:opacity-60">
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {hydrated && wishlist.length > 0 ? <Dot /> : null}
              </Link>
              <Link
                to="/profile"
                aria-label={user ? "My account" : "Sign in"}
                className="hidden h-11 w-11 place-items-center transition-opacity hover:opacity-60 sm:grid"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </Link>
              <Link to="/cart" aria-label="Shopping bag" className="relative grid h-11 w-11 place-items-center transition-opacity hover:opacity-60">
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {hydrated && cartCount > 0 ? (
                  <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-current px-1 text-[9px] font-medium leading-none">
                    <span className={transparent ? "text-foreground" : "text-background"}>
                      {cartCount}
                    </span>
                  </span>
                ) : null}
              </Link>
            </div>

          </div>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          className="top-24 max-w-2xl translate-y-0 rounded-[10px] border-border p-0"
        >
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center gap-3 border-b border-border px-5">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.25} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tees, denim, sarees…"
              className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
              <X className="h-4 w-4 text-muted-foreground" strokeWidth={1.25} />
            </button>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-3">
            {query && results.length === 0 ? (
              <p className="px-3 py-6 text-sm text-muted-foreground">
                No pieces match “{query}”. Try “t-shirt”, “denim” or “saree”.
              </p>
            ) : null}
            {results.map((p) => (
              <Link
                key={p.id}
                to="/product/$slug"
                params={{ slug: p.slug }}
                onClick={() => setSearchOpen(false)}
                className="flex items-center gap-4 rounded-[8px] p-3 transition-colors hover:bg-secondary"
              >
                <img
                  src={p.images[0]}
                  alt=""
                  width={80}
                  height={100}
                  loading="lazy"
                  className="h-16 w-12 rounded-[4px] object-cover"
                />
                <span className="flex-1 text-sm">{p.name}</span>
                <span className="text-sm text-muted-foreground">{formatPrice(p.price)}</span>
              </Link>
            ))}
            {!query ? (
              <div className="px-3 py-4">
                <p className="eyebrow mb-3">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {["T-shirt", "Denim", "Saree", "Kurta set", "Bedsheet"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setQuery(t.split(" ")[0]!)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-foreground"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Dot() {
  return <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-current" />;
}

function MegaMenu({ label, transparent }: { label: string; transparent: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className="static">
      <Link
        to="/shop"
        className="text-sm font-medium transition-colors hover:text-muted-foreground"
        aria-expanded={open}
      >
        {label}
      </Link>
      <div
        className={cn(
          "absolute inset-x-0 top-full border-b border-border bg-background text-foreground transition-all duration-300",
          open ? "visible opacity-100" : "invisible opacity-0",
          transparent && !open ? "" : "",
        )}
      >
        <div className="container-editorial grid grid-cols-4 gap-10 py-12">
          {groups.map((group) => (
            <div key={group}>
              <p className="eyebrow mb-4">{group}</p>
              <ul className="space-y-2.5">
                {categories
                  .filter((c) => c.group === group)
                  .map((c) => (
                    <li key={c.slug}>
                      <Link
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        onClick={() => setOpen(false)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="eyebrow mb-4">Featured</p>
            <Link to="/category/$slug" params={{ slug: "winter" }} onClick={() => setOpen(false)}>
              <img
                src={categories[7]!.image}
                alt="Winter collection"
                width={900}
                height={1200}
                loading="lazy"
                className="aspect-[4/5] w-full rounded-[8px] object-cover"
              />
              <p className="mt-3 font-display text-base">Autumn / Winter 26</p>
              <p className="text-xs text-muted-foreground">Coats, heavy knits and outerwear</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
