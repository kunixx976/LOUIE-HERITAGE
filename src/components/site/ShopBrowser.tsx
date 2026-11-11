import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { categories, type Product } from "@/lib/data";
import { formatPrice } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const PER_PAGE = 8;

type Sort = "featured" | "price-asc" | "price-desc" | "newest";

export function ShopBrowser({
  products,
  lockedCategory,
}: {
  products: Product[];
  lockedCategory?: string;
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [price, setPrice] = useState<number[]>([0, 3000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const facetProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (!lockedCategory || product.categories.includes(lockedCategory)) &&
          (!selectedCategories.length ||
            selectedCategories.some((category) => product.categories.includes(category))),
      ),
    [products, lockedCategory, selectedCategories],
  );
  const availableSizes = [...new Set(facetProducts.flatMap((product) => product.sizes))];
  const availableColors = [
    ...new Map(
      facetProducts.flatMap((product) => product.colors).map((color) => [color.name, color]),
    ).values(),
  ];

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const searchText = [p.name, p.description, p.fabric, ...p.categories].join(" ").toLocaleLowerCase();
      if (query.trim() && !searchText.includes(query.trim().toLocaleLowerCase())) return false;
      if (selectedCategories.length && !selectedCategories.some((c) => p.categories.includes(c)))
        return false;
      if (sizes.length && !sizes.some((s) => p.sizes.includes(s))) return false;
      if (colors.length && !colors.some((c) => p.colors.some((pc) => pc.name === c))) return false;
      if (p.price < price[0]! || p.price > price[1]!) return false;
      if (inStockOnly && !p.inStock) return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "newest":
        return [...result].sort(
          (a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")),
        );
      default:
        return result;
    }
  }, [products, selectedCategories, sizes, colors, price, inStockOnly, sort, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const activeCount =
    selectedCategories.length +
    sizes.length +
    colors.length +
    (price[0] !== 0 || price[1] !== 3000 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (query.trim() ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]);
    setSizes([]);
    setColors([]);
    setPrice([0, 3000]);
    setInStockOnly(false);
    setQuery("");
    setPage(1);
  };

  const filterPanel = (
    <div className="space-y-9">
      {!lockedCategory ? (
        <FilterGroup title="Category">
          <ul className="space-y-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Checkbox
                    checked={selectedCategories.includes(c.slug)}
                    onCheckedChange={() =>
                      toggle(selectedCategories, setSelectedCategories, c.slug)
                    }
                    className="rounded-[3px]"
                  />
                  {c.name}
                </label>
              </li>
            ))}
          </ul>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(sizes, setSizes, s)}
              className={cn(
                "min-h-11 min-w-11 rounded-[8px] border border-border px-3 text-xs transition-colors hover:border-foreground lg:min-h-0 lg:py-2",
                sizes.includes(s) && "border-foreground bg-foreground text-background",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-3">
          {availableColors.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={`Filter by ${c.name}`}
              aria-pressed={colors.includes(c.name)}
              onClick={() => toggle(colors, setColors, c.name)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <span
                aria-hidden="true"
                style={{ backgroundColor: c.hex }}
                className={cn(
                  "h-7 w-7 rounded-full border border-border transition-all",
                  colors.includes(c.name) &&
                    "ring-1 ring-foreground ring-offset-2 ring-offset-background",
                )}
              />
              {c.name}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <Slider
          value={price}
          min={0}
          max={3000}
          step={50}
          onValueChange={(v) => {
            setPrice(v);
            setPage(1);
          }}
        />
        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(price[0]!)}</span>
          <span>{formatPrice(price[1]!)}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => {
              setInStockOnly(Boolean(v));
              setPage(1);
            }}
            className="rounded-[3px]"
          />
          In stock only
        </label>
      </FilterGroup>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-muted-foreground link-underline"
        >
          <X className="h-3 w-3" strokeWidth={1.5} /> Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="container-editorial grid gap-12 py-10 md:py-16 lg:grid-cols-12 lg:gap-14">
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-28">{filterPanel}</div>
      </aside>

      <div className="lg:col-span-9">
        <label className="relative mb-5 block">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, fabric or style"
            aria-label="Search products by name, fabric or style"
            className="h-12 w-full rounded-[8px] border border-border bg-background pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </label>
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <p className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="flex h-11 items-center gap-2 rounded-[8px] border border-border px-4 text-xs uppercase tracking-[0.12em] lg:hidden">
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.4} />
                Filters {activeCount > 0 ? `(${activeCount})` : ""}
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto bg-background">
                <SheetTitle className="font-display text-xl font-normal">Filters</SheetTitle>
                <div className="mt-8">{filterPanel}</div>
              </SheetContent>
            </Sheet>

            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v as Sort);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-[9.5rem] rounded-[8px] border-border text-xs sm:w-[11.5rem] lg:h-9">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-xl">Nothing matches those filters</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Try widening the price range or clearing a size.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 rounded-[8px] border border-border px-6 py-3 text-[11px] uppercase tracking-[0.16em] transition-colors hover:border-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div>
            <p className="mt-5 text-xs text-muted-foreground" aria-live="polite">
              Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, filtered.length)}{" "}
              of {filtered.length} pieces
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:mt-6 md:grid-cols-3 md:gap-y-14">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {pages > 1 ? (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-center gap-2 border-t border-border pt-8"
          >
            <button
              type="button"
              aria-label="Previous page"
              disabled={current === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="h-11 rounded-[8px] border border-border px-4 text-xs disabled:opacity-40 sm:h-9"
            >
              Previous
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === current ? "page" : undefined}
                onClick={() => {
                  setPage(n);
                  window.scrollTo({ top: 200, behavior: "smooth" });
                }}
                className={cn(
                  "h-11 w-11 rounded-[8px] border border-transparent text-xs transition-colors hover:border-border sm:h-9 sm:w-9",
                  n === current && "border-foreground",
                )}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={current === pages}
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
              className="h-11 rounded-[8px] border border-border px-4 text-xs disabled:opacity-40 sm:h-9"
            >
              Next
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      {children}
    </div>
  );
}
