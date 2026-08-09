import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { allColors, allSizes, categories, type Product } from "@/lib/data";
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

type Sort = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

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
  const [price, setPrice] = useState<number[]>([0, 700]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [page, setPage] = useState(1);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
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
      case "rating":
        return [...result].sort((a, b) => b.rating - a.rating);
      case "newest":
        return [...result].sort(
          (a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")),
        );
      default:
        return result;
    }
  }, [products, selectedCategories, sizes, colors, price, inStockOnly, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const activeCount =
    selectedCategories.length + sizes.length + colors.length + (inStockOnly ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]);
    setSizes([]);
    setColors([]);
    setPrice([0, 700]);
    setInStockOnly(false);
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
          {allSizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(sizes, setSizes, s)}
              className={cn(
                "min-w-11 rounded-[8px] border border-border px-3 py-2 text-xs transition-colors hover:border-foreground",
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
          {allColors.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={c.name}
              aria-pressed={colors.includes(c.name)}
              onClick={() => toggle(colors, setColors, c.name)}
              style={{ backgroundColor: c.hex }}
              className={cn(
                "h-7 w-7 rounded-full border border-border transition-all",
                colors.includes(c.name) &&
                  "ring-1 ring-foreground ring-offset-2 ring-offset-background",
              )}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <Slider
          value={price}
          min={0}
          max={700}
          step={10}
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
    <div className="container-editorial grid gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-14">
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-28">{filterPanel}</div>
      </aside>

      <div className="lg:col-span-9">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <p className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="flex items-center gap-2 rounded-[8px] border border-border px-4 py-2 text-xs uppercase tracking-[0.12em] lg:hidden">
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.4} />
                Filters {activeCount > 0 ? `(${activeCount})` : ""}
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto bg-background">
                <SheetTitle className="font-display text-xl font-normal">Filters</SheetTitle>
                <div className="mt-8">{filterPanel}</div>
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="h-9 w-[11.5rem] rounded-[8px] border-border text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
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
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {pages > 1 ? (
          <nav
            aria-label="Pagination"
            className="mt-16 flex items-center justify-center gap-2 border-t border-border pt-10"
          >
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
                  "h-9 w-9 rounded-[8px] border border-transparent text-xs transition-colors hover:border-border",
                  n === current && "border-foreground",
                )}
              >
                {n}
              </button>
            ))}
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
