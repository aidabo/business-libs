export type EstateCoreLocale = "ja" | "en" | "zh";

export type EstateDictionaryTerm = { source: string; ja?: string; en?: string; zh?: string; category?: string };

export type EstateLocalizedValue = {
  text: string;
  kind: "term" | "proper" | "free" | "number";
  resolved: "dictionary" | "provider" | "fallback-ja";
  /** Original provider/dictionary text; not a property field key. */
  source?: string;
};

export type EstatePropertyLocaleViewModel = {
  locale: EstateCoreLocale;
  title: EstateLocalizedValue;
  propertyType: EstateLocalizedValue;
  price: { label: EstateLocalizedValue; value: EstateLocalizedValue };
  area: EstateLocalizedValue;
  floorPlan: EstateLocalizedValue;
  access: EstateLocalizedValue;
  nearbyStores: EstateLocalizedValue[];
  nearbyHospitals: EstateLocalizedValue[];
  nearbySchools: EstateLocalizedValue[];
  nearbyParks: EstateLocalizedValue[];
  features: EstateLocalizedValue[];
  structure: EstateLocalizedValue;
  hazardItems: EstateLocalizedValue[];
  places: Array<{ placeId: string; name: EstateLocalizedValue; address: EstateLocalizedValue; mapsUrl: string; walkingMinutes?: number }>;
  sources: { googlePlacesFetchedAt?: string; googlePlacesSourceLocale?: EstateCoreLocale; googlePlacesSchemaVersion?: number; mlitFetchedAt?: string; mlitSourceLocale?: string; dictionaryVersion?: string };
};

const TYPE_LABELS: Record<EstateCoreLocale, Record<string, string>> = {
  ja: { sale: "実需", rent: "賃貸", investment: "投資" },
  en: { sale: "Owner-occupied", rent: "Rent", investment: "Investment" },
  zh: { sale: "自住", rent: "出租", investment: "投资" },
};
const PRICE_LABELS: Record<EstateCoreLocale, string> = { ja: "価格", en: "Price", zh: "价格" };
const HAZARD_LABELS: Record<EstateCoreLocale, Record<string, string>> = {
  ja: {
    liquefaction_info: "液状化",
    flood_inundation_info: "洪水浸水",
    storm_surge_info: "高潮浸水",
    tsunami_info: "津波浸水",
    landslide_warning_info: "土砂災害警戒区域",
    disaster_hazard_area_info: "災害危険区域",
    large_scale_fill_info: "大規模盛土造成地",
    landslide_prevention_info: "地すべり防止地区",
    steep_slope_info: "急傾斜地崩壊危険区域",
  },
  en: {
    liquefaction_info: "Liquefaction",
    flood_inundation_info: "Flood inundation",
    storm_surge_info: "Storm surge inundation",
    tsunami_info: "Tsunami inundation",
    landslide_warning_info: "Landslide warning area",
    disaster_hazard_area_info: "Disaster hazard area",
    large_scale_fill_info: "Large-scale fill area",
    landslide_prevention_info: "Landslide prevention area",
    steep_slope_info: "Steep slope collapse risk area",
  },
  zh: {
    liquefaction_info: "液化风险",
    flood_inundation_info: "洪水浸水",
    storm_surge_info: "高潮浸水",
    tsunami_info: "海啸浸水",
    landslide_warning_info: "泥石流灾害警戒区",
    disaster_hazard_area_info: "灾害危险区域",
    large_scale_fill_info: "大规模填土区域",
    landslide_prevention_info: "滑坡防治区",
    steep_slope_info: "陡坡崩塌危险区",
  },
};
const toText = (value: unknown) => String(value ?? "").trim();
export const formatEstateMoney = (value: unknown, suffix = "") => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const numericText = typeof value === "number" ? String(value) : raw.slice(raw.search(/-?\d/));
  const unitMatches = [...numericText.matchAll(/(-?[\d,]+(?:\.\d+)?)\s*(千万円?|億|万|千)/g)];
  let number: number;
  if (unitMatches.length > 0) {
    const firstNonContiguousIndex = unitMatches.findIndex((match, index) => {
      if (index === 0) return false;
      const previous = unitMatches[index - 1];
      const gap = numericText.slice((previous.index || 0) + previous[0].length, match.index || 0);
      return !/^\s*$/.test(gap);
    });
    const contiguousMatches = unitMatches.slice(0, firstNonContiguousIndex === -1 ? unitMatches.length : firstNonContiguousIndex);
    number = contiguousMatches.reduce((total, match) => {
      const amount = Number(match[1].replace(/,/g, ""));
      const multiplier = match[2].startsWith("千万") ? 10000000 : match[2] === "億" ? 100000000 : match[2] === "万" ? 10000 : 1000;
      return total + (Number.isFinite(amount) ? amount * multiplier : 0);
    }, 0);
    const lastMatch = contiguousMatches[contiguousMatches.length - 1];
    const remainder = numericText.slice((lastMatch.index || 0) + lastMatch[0].length).match(/^(-?[\d,]+(?:\.\d+)?)(?:\s*円)?(?:\s*)$/);
    if (remainder?.[1]) number += Number(remainder[1].replace(/,/g, ""));
  } else {
    const numericPart = numericText.match(/-?[\d,]+(?:\.\d+)?/)?.[0] || "";
    number = Number(numericPart.replace(/,/g, ""));
  }
  if (!Number.isFinite(number) || number <= 0) return /\d/.test(raw) ? "" : raw;
  return `¥${Math.round(number).toLocaleString("ja-JP")}${suffix}`;
};
export const formatEstateArea = (value: unknown) => {
  const text = toText(value).replace(/m(?:2|²|\^2)\b/gi, "㎡");
  if (!text) return "";
  return text.includes("㎡") ? text : `${text}㎡`;
};
export const formatEstateTypeLabel = (value: unknown, locale: EstateCoreLocale) => {
  const key = toText(value).toLowerCase();
  return TYPE_LABELS[locale][key] || TYPE_LABELS[locale].sale;
};
export const formatEstatePrice = (property: Record<string, any>, locale: EstateCoreLocale) => {
  const isRent = toText(firstValue(property, ["property_type", "propertyType"])).toLowerCase() === "rent";
  const rentSuffix = locale === "en" ? "/mo" : "/月";
  const firstFormatted = (keys: string[], suffix = "") => keys.map((key) => formatEstateMoney(property[key], suffix)).find(Boolean) || "";
  const salePrice = firstFormatted(["price_sale", "priceSale", "salePrice", "priceJPY", "price_jpy", "price"]);
  const rentPrice = firstFormatted(["price_rent_monthly", "priceRentMonthly", "monthlyRent", "current_rent", "expected_rent", "expectedRent"], rentSuffix);
  const rentFallback = firstFormatted(["price_sale", "priceSale", "salePrice", "priceJPY", "price_jpy"])
    || firstFormatted(["price"], rentSuffix);
  return isRent
    ? rentPrice || rentFallback
    : salePrice || firstFormatted(["price_rent_monthly", "priceRentMonthly", "monthlyRent", "current_rent"], rentSuffix);
};
const value = (text: unknown, kind: EstateLocalizedValue["kind"], resolved: EstateLocalizedValue["resolved"] = "fallback-ja", source?: string): EstateLocalizedValue => ({ text: toText(text), kind, resolved, ...(source ? { source } : {}) });
const parseJson = (input: unknown): any | null => { if (!input) return null; if (typeof input === "object") return input; try { return JSON.parse(String(input)); } catch { return null; } };
const lines = (input: unknown): string[] => {
  if (Array.isArray(input)) return input.map(toText).filter(Boolean);
  const text = toText(input);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return lines(parsed);
  } catch {
    // Plain text remains supported below.
  }
  return text.split(/\r?\n|、|,|，/).map((item) => item.trim()).filter(Boolean);
};
const dictionaryText = (text: string, locale: EstateCoreLocale, dictionary: EstateDictionaryTerm[]) => {
  const match = dictionary.find((term) => term.source === text);
  if (!match) return value(text, "free");
  const localized = toText(match[locale]);
  return localized ? value(localized, "term", "dictionary", match.source) : value(match.source, "free", "fallback-ja", match.source);
};
const localizedPlaceValue = (item: any, field: "name" | "address", locale: EstateCoreLocale) => { const localized = item?.localized?.[locale]?.[field]; const source = item?.localized?.ja?.[field] || item?.[field]; return localized ? value(localized, "proper", "provider", source !== localized ? source : undefined) : value(source, "proper"); };
const firstValue = (property: Record<string, any>, keys: string[]) => keys.map((key) => property[key]).find((item) => item !== undefined && item !== null && item !== 0 && String(item).trim() !== "" && String(item).trim() !== "0");
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hazardValues = (property: Record<string, any>, locale: EstateCoreLocale) => Object.entries(HAZARD_LABELS[locale]).flatMap(([key, label]) => {
  const raw = property[key];
  if (!raw) return [];
  const sourceLabel = HAZARD_LABELS.ja[key as keyof typeof HAZARD_LABELS.ja];
  const text = toText(raw).replace(new RegExp(`^${escapeRegExp(sourceLabel)}\\s*[:：]\\s*`), "");
  return text ? [value(`${label}: ${text}`, "free", "fallback-ja", text)] : [];
});

export function buildEstatePropertyLocaleViewModel(property: Record<string, any>, locale: EstateCoreLocale = "ja", dictionary: EstateDictionaryTerm[] = [], dictionaryVersion?: string): EstatePropertyLocaleViewModel {
  const currentLocale = locale === "en" || locale === "zh" ? locale : "ja";
  const type = toText(firstValue(property, ["property_type", "propertyType"])).toLowerCase();
  const buildingName = firstValue(property, ["building_name", "buildingName", "title", "name"]);
  const area = firstValue(property, ["floor_area", "floorArea", "building_area", "buildingArea", "area_sqm", "areaSqm", "sqm", "area", "land_area", "landArea"]);
  const floorPlan = firstValue(property, ["floor_plan", "floorPlan", "rooms"]);
  const access = firstValue(property, ["transport_info", "transportInfo", "transport", "nearest_station", "nearestStation"]);
  const features = [
    ...lines(firstValue(property, ["features"])),
    ...lines(firstValue(property, ["fixtures_and_fittings", "fixturesAndFittings"])),
  ];
  const structure = firstValue(property, ["structure", "buildingStructure"]);
  const priceProperty = { ...property, property_type: type };
  const places = parseJson(firstValue(property, ["google_places_data", "googlePlacesData"]));
  const mlit = parseJson(property.mlit_data);
  const schemaVersionRaw = places?.schema_version;
  const googlePlacesSchemaVersion = schemaVersionRaw === null || schemaVersionRaw === undefined || schemaVersionRaw === ""
    ? undefined
    : Number.isFinite(Number(schemaVersionRaw)) ? Number(schemaVersionRaw) : undefined;
  const placeItems = Object.values(places || {}).flatMap((group: any) => {
    if (Array.isArray(group?.items)) return group.items;
    if (group && typeof group === "object") return Object.values(group).flatMap((nested: any) => Array.isArray(nested?.items) ? nested.items : []);
    return [];
  }).filter((item: any) => item?.placeId || item?.place_id || item?.localized);
  return {
    locale: currentLocale,
    title: value(buildingName, "proper"),
    propertyType: type && TYPE_LABELS[currentLocale][type] ? value(formatEstateTypeLabel(type, currentLocale), "term", "dictionary", type) : value(type, "free", "fallback-ja"),
    price: { label: value(PRICE_LABELS[currentLocale], "term", "dictionary"), value: (() => { const text = formatEstatePrice(priceProperty, currentLocale); return value(text, !text || /^¥[0-9]/.test(text) ? "number" : "free"); })() },
    area: value(formatEstateArea(area), "number"),
    floorPlan: value(floorPlan, "proper"),
    access: value(access, "proper"),
    nearbyStores: lines(property.nearby_stores).map((item) => dictionaryText(item, currentLocale, dictionary)),
    nearbyHospitals: lines(property.nearby_hospitals).map((item) => dictionaryText(item, currentLocale, dictionary)),
    nearbySchools: lines(property.nearby_schools).map((item) => dictionaryText(item, currentLocale, dictionary)),
    nearbyParks: lines(property.nearby_parks).map((item) => dictionaryText(item, currentLocale, dictionary)),
    features: features.map((item) => dictionaryText(item, currentLocale, dictionary)),
    structure: dictionaryText(toText(structure), currentLocale, dictionary),
    hazardItems: hazardValues(property, currentLocale),
    places: placeItems.map((item: any) => ({ placeId: toText(item.placeId || item.place_id), name: localizedPlaceValue(item, "name", currentLocale), address: localizedPlaceValue(item, "address", currentLocale), mapsUrl: toText(item.googleMapsUrl || item.googleMapsUri || item.google_maps_url || item.google_maps_uri || item.mapsUrl || item.mapsUri || item.url), walkingMinutes: item.walkingMinutes === null || item.walkingMinutes === undefined || item.walkingMinutes === "" ? undefined : Number.isFinite(Number(item.walkingMinutes)) ? Number(item.walkingMinutes) : undefined })),
    sources: {
      googlePlacesFetchedAt: toText(places?.fetched_at || places?.fetchedAt) || undefined,
      googlePlacesSourceLocale: places?.source_locale === "en" || places?.source_locale === "zh" ? places.source_locale : places?.source_locale === "ja" ? "ja" : undefined,
      googlePlacesSchemaVersion,
      mlitFetchedAt: toText(mlit?.fetched_at || mlit?.fetchedAt) || undefined,
      mlitSourceLocale: mlit ? toText(mlit.source_locale) || "ja" : undefined,
      dictionaryVersion: toText(dictionaryVersion) || undefined,
    },
  };
}
