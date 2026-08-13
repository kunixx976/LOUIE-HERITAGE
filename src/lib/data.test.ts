import test from "node:test";
import assert from "node:assert/strict";
import { getProduct, products } from "./data";

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
