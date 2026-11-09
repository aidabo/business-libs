import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildEstatePropertyLocaleViewModel,
  formatEstateArea,
  formatEstateFloor,
  formatEstateMoney,
  formatEstatePrice,
  formatEstateYear,
  isRentLike,
} from "../dist/core.js";

const property = {
  property_type: "賃貸",
  building_name: "港区レジデンス",
  price_rent_monthly: "86,000円（税込）",
  price_jpy: "1,820万円",
  floor_area: 42.1,
  floor_plan: "1LDK",
  transport_info: "梅ヶ丘駅 徒歩5分",
  year_built: "1998-03",
  features: ["エレベーター"],
};

test("preserves annotated source prices and avoids duplicate monthly suffixes", () => {
  assert.equal(formatEstateMoney("86,000円（税込）", "/月"), "86,000円（税込）/月");
  assert.equal(formatEstateMoney("¥86,000/月", "/月"), "¥86,000/月");
  assert.equal(formatEstateMoney("応相談", "/月"), "応相談");
  assert.equal(formatEstatePrice({ property_type: "sale", price_jpy: "1,820万円" }, "en"), "1,820万円");
});

test("uses locale-aware numeric units and floor/year display", () => {
  assert.equal(formatEstateMoney(170500, "/mo", "en"), "¥170,500/mo");
  assert.equal(formatEstateArea(42.1, "en"), "42.1㎡");
  assert.equal(formatEstateFloor("4", "en"), "4F");
  assert.equal(formatEstateFloor("1", "en", true), "1 floor");
  assert.equal(formatEstateFloor("4", "en", true), "4 floors");
  assert.equal(formatEstateYear("1998-03", "ja"), "1998-03");
  assert.equal(formatEstateYear("2018", "ja"), "2018年");
});

test("normalizes rent aliases and builds the same locale view model contract", () => {
  assert.equal(isRentLike("賃貸"), true);
  assert.equal(isRentLike("rent_house"), true);
  assert.equal(isRentLike("sale"), false);
  const view = buildEstatePropertyLocaleViewModel(property, "en");
  assert.equal(view.title.text, "港区レジデンス");
  assert.equal(view.price.value.text, "86,000円（税込）/mo");
  assert.equal(view.area.text, "42.1㎡");
  assert.equal(view.floorPlan.text, "1LDK");
  assert.equal(view.access.text, "梅ヶ丘駅 徒歩5分");
});

test("keeps Grid and Table as binding-fed components", async () => {
  for (const component of ["PropertyGrid.tsx", "PropertyTable.tsx"]) {
    const source = await readFile(new URL(`../src/${component}`, import.meta.url), "utf8");
    assert.match(source, /properties\?/);
    assert.match(source, /Array\.isArray\(properties\)/);
    assert.doesNotMatch(source, /\bfetch\s*\(/);
    assert.doesNotMatch(source, /useEstateHostDataSources/);
  }
});

test("keeps Card and Detail on binding, page-state, query, and existing API paths", async () => {
  const card = await readFile(new URL("../src/PropertyCard.tsx", import.meta.url), "utf8");
  const detail = await readFile(new URL("../src/PropertyDetail.tsx", import.meta.url), "utf8");
  const resolver = await readFile(new URL("../src/PropertyInfoCardBase.tsx", import.meta.url), "utf8");

  assert.match(card, /useResolvedPropertyRecord/);
  assert.match(card, /items\?:/);
  assert.match(card, /selectedPropertyId\?:/);
  assert.match(card, /selectedPropertyIdKey\?:/);
  assert.match(card, /onCardClick/);
  assert.match(detail, /items\?:/);
  assert.match(detail, /selectedPropertyIdKey\?:/);
  assert.match(detail, /getPageState\(__stackpage, selectedPropertyIdKey/);
  assert.match(detail, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(detail, /\/api\/estate\/properties-public\//);
  assert.match(resolver, /__bindings/);
  assert.match(resolver, /items\?\.sourceId/);
  assert.match(resolver, /\/api\/estate\/properties-public\//);
});
