import test from "node:test";
import assert from "node:assert/strict";
import { getProduct, mergeLiveCatalog, products } from "./data";

test("products expose sku-level inventory and stock state is derived from variants", () => {
  const product = getProduct("panipat-handloom-throw");
  assert.ok(product, "product should exist");
  assert.ok(Array.isArray(product.variants), "product variants should exist");
  assert.ok(product.variants.length > 0, "at least one variant should exist");
  assert.equal(product.inStock, false, "out-of-stock product should resolve false");

  const firstVariant = product.variants[0];
  assert.ok(firstVariant, "first variant should exist");
  assert.ok(typeof firstVariant.stockCount === "number", "variant requires stockCount");
  assert.ok(typeof firstVariant.size === "string", "variant requires size");
  assert.ok(typeof firstVariant.color === "string", "variant requires color");
  assert.ok(products.some((item) => item.variants.some((variant) => variant.stockCount >= 0)));
});

test("live catalog values replace local price, sizes, colours and inventory", () => {
  const [product] = mergeLiveCatalog(
    [{ id: "1", slug: "tirupur-classic-cotton-tee", name: "Live Tee", price: 999, active: true }],
    [
      {
        id: "1-black-m",
        product_id: "1",
        sku: "LH-1-BLA-M",
        size: "M",
        color: "Black",
        color_hex: "#111111",
        stock_count: 2,
      },
    ],
  );

  assert.ok(product);
  assert.equal(product.name, "Live Tee");
  assert.equal(product.price, 999);
  assert.deepEqual(product.sizes, ["M"]);
  assert.deepEqual(product.colors, [{ name: "Black", hex: "#111111" }]);
  assert.equal(product.variants[0]?.stockCount, 2);
});
