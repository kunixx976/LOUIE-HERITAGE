import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { categories, products } from "@/lib/data";
import { formatPrice, useShop } from "@/lib/shop-store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const groups = ["Collections", "Clothing", "Seasonal"] as const;

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { cartCount, wishlist, user, hydrated } = useShop();

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
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-border/80 bg-background/90 text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.035)] backdrop-blur-xl">
        <div className="container-editorial">
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-[72px]">
            {/* Left — navigation */}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
              <MegaMenu label="Shop" />
              <MegaMenu label="Women" variant="women" />
              <Link
                to="/category/$slug"
                params={{ slug: "men" }}
                className="text-sm font-medium transition-colors hover:text-muted-foreground"
              >
                Men
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium transition-colors hover:text-muted-foreground"
              >
                About
              </Link>
            </nav>

            <div className="flex lg:hidden">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger
                  aria-label="Open menu"
                  className="-ml-3 grid h-11 w-11 place-items-center"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.25} />
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-[86vw] max-w-sm overflow-y-auto bg-background p-0"
                >
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <div className="px-6 pb-10 pt-8">
                    <p className="font-display text-xl">LOUIE HERITAGE</p>
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
              LOUIE HERITAGE
            </Link>

            {/* Right — utilities */}
            <div className="-mr-2.5 flex items-center justify-end md:-mr-2 md:gap-1">
              <button
                type="button"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="flex h-11 items-center justify-center gap-2 px-2 transition-opacity hover:opacity-60"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
                <span className="hidden text-xs lg:inline">Search</span>
              </button>
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative grid h-11 w-11 place-items-center transition-opacity hover:opacity-60"
              >
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
              <Link
                to="/cart"
                aria-label={`Shopping bag, ${hydrated ? cartCount : 0} ${
                  hydrated && cartCount === 1 ? "item" : "items"
                }`}
                className="relative grid h-11 w-11 place-items-center transition-opacity hover:opacity-60"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {hydrated ? (
                  <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-current px-1 text-[9px] font-medium leading-none">
                    <span className="text-background">{cartCount}</span>
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-24 max-w-2xl translate-y-0 rounded-[10px] border-border p-0">
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

const womenMenuLinks = [
  { label: "Dresses", slug: "ethnic" },
  { label: "Tops", slug: "women" },
  { label: "Tees", slug: "tshirts" },
  { label: "Skirts", slug: "women" },
  { label: "Denim", slug: "denim" },
  { label: "Trousers", slug: "women" },
  { label: "Accessories", slug: "accessories" },
] as const;

function MegaMenu({ label, variant = "shop" }: { label: string; variant?: "shop" | "women" }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const isWomen = variant === "women";
  const menuId = isWomen ? "women-mega-menu" : "shop-mega-menu";

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.8 };
  const columnVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="static"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      {isWomen ? (
        <Link
          to="/category/$slug"
          params={{ slug: "women" }}
          className="relative text-sm font-medium transition-colors hover:text-muted-foreground"
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls={menuId}
          onFocus={() => setOpen(true)}
        >
          {label}
          {open ? (
            <motion.span
              layoutId="primary-nav-indicator"
              className="absolute -bottom-[9px] left-0 right-0 h-px bg-current"
              transition={panelTransition}
            />
          ) : null}
        </Link>
      ) : (
        <Link
          to="/shop"
          className="relative text-sm font-medium transition-colors hover:text-muted-foreground"
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls={menuId}
          onFocus={() => setOpen(true)}
        >
          {label}
          {open ? (
            <motion.span
              layoutId="primary-nav-indicator"
              className="absolute -bottom-[9px] left-0 right-0 h-px bg-current"
              transition={panelTransition}
            />
          ) : null}
        </Link>
      )}

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={menuId}
            key={menuId}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
            transition={panelTransition}
            className="absolute inset-x-0 top-full origin-top overflow-hidden border-b border-border bg-background text-foreground shadow-sm"
          >
            <motion.div
              className="container-editorial grid grid-cols-4 gap-10 py-12"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: reduceMotion
                    ? { duration: 0 }
                    : { staggerChildren: 0.06, delayChildren: 0.04 },
                },
              }}
            >
              {isWomen ? (
                <>
                  <motion.div variants={columnVariants} transition={panelTransition}>
                    <p className="eyebrow mb-4">Clothing</p>
                    <ul className="space-y-2.5">
                      {womenMenuLinks.slice(0, 4).map((item) => (
                        <li key={item.label}>
                          <Link
                            to="/category/$slug"
                            params={{ slug: item.slug }}
                            onClick={() => setOpen(false)}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  <motion.div variants={columnVariants} transition={panelTransition}>
                    <p className="eyebrow mb-4">More to explore</p>
                    <ul className="space-y-2.5">
                      {womenMenuLinks.slice(4).map((item) => (
                        <li key={item.label}>
                          <Link
                            to="/category/$slug"
                            params={{ slug: item.slug }}
                            onClick={() => setOpen(false)}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          to="/category/$slug"
                          params={{ slug: "women" }}
                          onClick={() => setOpen(false)}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Shop all women
                        </Link>
                      </li>
                    </ul>
                  </motion.div>
                  <motion.div
                    variants={columnVariants}
                    transition={panelTransition}
                    className="col-span-2"
                  >
                    <Link
                      to="/category/$slug"
                      params={{ slug: "women" }}
                      onClick={() => setOpen(false)}
                    >
                      <img
                        src={categories.find((category) => category.slug === "women")!.image}
                        alt="Women’s collection"
                        width={900}
                        height={600}
                        loading="lazy"
                        className="h-56 w-full rounded-[8px] object-cover object-center"
                      />
                      <p className="mt-3 font-display text-base">The women’s collection</p>
                      <p className="text-xs text-muted-foreground">
                        Explore the pieces currently in the collection
                      </p>
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  {groups.map((group) => (
                    <motion.div key={group} variants={columnVariants} transition={panelTransition}>
                      <p className="eyebrow mb-4">{group}</p>
                      <ul className="space-y-2.5">
                        {categories
                          .filter((category) => category.group === group)
                          .map((category) => (
                            <li key={category.slug}>
                              <Link
                                to="/category/$slug"
                                params={{ slug: category.slug }}
                                onClick={() => setOpen(false)}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                              >
                                {category.name}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </motion.div>
                  ))}
                  <motion.div variants={columnVariants} transition={panelTransition}>
                    <p className="eyebrow mb-4">Featured</p>
                    <Link
                      to="/category/$slug"
                      params={{ slug: "winter" }}
                      onClick={() => setOpen(false)}
                    >
                      <img
                        src={categories.find((category) => category.slug === "winter")!.image}
                        alt="Winter collection"
                        width={900}
                        height={1200}
                        loading="lazy"
                        className="aspect-[4/5] w-full rounded-[8px] object-cover"
                      />
                      <p className="mt-3 font-display text-base">Autumn / Winter 26</p>
                      <p className="text-xs text-muted-foreground">
                        Coats, heavy knits and outerwear
                      </p>
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
