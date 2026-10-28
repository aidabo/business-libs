export type EstateCoreLocale = "ja" | "en" | "zh";

export type EstateDictionaryTerm = { source: string; ja?: string; en?: string; zh?: string; category?: string };

export type EstateLocalizedValue = {
  text: string;
  kind: "term" | "proper" | "free" | "number";
  resolved: "dictionary" | "provider" | "fallback-ja";
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
  places: Array<{ placeId: string; name: EstateLocalizedValue; address: EstateLocalizedValue; mapsUrl: string; walkingMinutes?: number }>;
  sources: { googlePlacesFetchedAt?: string; mlitFetchedAt?: string; dictionaryVersion?: string };
};

const TYPE_LABELS: Record<EstateCoreLocale, Record<string, string>> = {
  ja: { sale: "実需", rent: "賃貸", investment: "投資" },
  en: { sale: "Owner-occupied", rent: "Rent", investment: "Investment" },
  zh: { sale: "自住", rent: "出租", investment: "投资" },
};
const PRICE_LABELS: Record<EstateCoreLocale, string> = { ja: "価格", en: "Price", zh: "价格" };
const toText = (value: unknown) => String(value ?? "").trim();
export const formatEstateMoney = (value: unknown, suffix = "") => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const number = typeof value === "number" ? value : Number(raw.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(number) || number <= 0) return "";
  return `¥${Math.round(number).toLocaleString("ja-JP")}${suffix}`;
};
export const formatEstateArea = (value: unknown) => {
  const text = toText(value);
  if (!text) return "";
  return text.includes("㎡") ? text : `${text}㎡`;
};
export const formatEstateTypeLabel = (value: unknown, locale: EstateCoreLocale) => {
  const key = toText(value).toLowerCase();
  return TYPE_LABELS[locale][key] || TYPE_LABELS[locale].sale;
};
export const formatEstatePrice = (property: Record<string, any>, locale: EstateCoreLocale) => {
  const isRent = toText(property.property_type).toLowerCase() === "rent";
  const rentSuffix = locale === "en" ? "/mo" : "/月";
  return isRent
    ? formatEstateMoney(property.price_rent_monthly, rentSuffix) || formatEstateMoney(property.price_sale)
    : formatEstateMoney(property.price_sale) || formatEstateMoney(property.price_rent_monthly, rentSuffix);
};
const value = (text: unknown, kind: EstateLocalizedValue["kind"], resolved: EstateLocalizedValue["resolved"] = "fallback-ja", source?: string): EstateLocalizedValue => ({ text: toText(text), kind, resolved, ...(source ? { source } : {}) });
const parseJson = (input: unknown): any | null => { if (!input) return null; if (typeof input === "object") return input; try { return JSON.parse(String(input)); } catch { return null; } };
const lines = (input: unknown): string[] => Array.isArray(input) ? input.map(toText).filter(Boolean) : toText(input).split(/\r?\n|、|,|，/).map((item) => item.trim()).filter(Boolean);
const dictionaryText = (text: string, locale: EstateCoreLocale, dictionary: EstateDictionaryTerm[]) => { const match = dictionary.find((term) => term.source === text); return match ? value(match[locale] || match.source, "term", "dictionary", match.source) : value(text, "free"); };
const localizedPlaceValue = (item: any, field: "name" | "address", locale: EstateCoreLocale) => { const localized = item?.localized?.[locale]?.[field]; const source = item?.localized?.ja?.[field] || item?.[field]; return localized ? value(localized, "proper", "provider", source !== localized ? source : undefined) : value(source, "proper"); };
const firstValue = (property: Record<string, any>, keys: string[]) => keys.map((key) => property[key]).find((item) => item !== undefined && item !== null && String(item).trim() !== "");

export function buildEstatePropertyLocaleViewModel(property: Record<string, any>, locale: EstateCoreLocale = "ja", dictionary: EstateDictionaryTerm[] = [], dictionaryVersion?: string): EstatePropertyLocaleViewModel {
  const currentLocale = locale === "en" || locale === "zh" ? locale : "ja";
  const type = toText(firstValue(property, ["property_type", "propertyType"])).toLowerCase();
  const buildingName = firstValue(property, ["building_name", "buildingName", "title", "name"]);
  const salePrice = firstValue(property, ["price_sale", "priceJPY", "price_jpy"]);
  const rentPrice = firstValue(property, ["price_rent_monthly", "priceRentMonthly", "current_rent"]);
  const area = firstValue(property, ["floor_area", "building_area", "area_sqm", "areaSqm", "sqm"]);
  const floorPlan = firstValue(property, ["floor_plan", "floorPlan", "rooms"]);
  const access = firstValue(property, ["transport_info", "transportInfo", "transport", "nearest_station", "nearestStation"]);
  const features = firstValue(property, ["features", "fixtures_and_fittings", "fixturesAndFittings"]);
  const structure = firstValue(property, ["structure", "buildingStructure"]);
  const priceProperty = { ...property, property_type: type, price_sale: salePrice, price_rent_monthly: rentPrice };
  const places = parseJson(firstValue(property, ["google_places_data", "googlePlacesData"]));
  const placeItems = Object.values(places || {}).flatMap((group: any) => {
    if (Array.isArray(group?.items)) return group.items;
    if (group && typeof group === "object") return Object.values(group).flatMap((nested: any) => Array.isArray(nested?.items) ? nested.items : []);
    return [];
  }).filter((item: any) => item?.placeId || item?.place_id || item?.localized);
  return {
    locale: currentLocale,
    title: value(buildingName, "proper"),
    propertyType: type && TYPE_LABELS[currentLocale][type] ? value(formatEstateTypeLabel(type, currentLocale), "term", "dictionary", type) : value(type, "free", "fallback-ja"),
    price: { label: value(PRICE_LABELS[currentLocale], "term", "dictionary"), value: value(formatEstatePrice(priceProperty, currentLocale), "number") },
    area: value(formatEstateArea(area), "number"),
    floorPlan: value(floorPlan, "proper"),
    access: value(access, "proper"),
    nearbyStores: lines(property.nearby_stores).map((item) => dictionaryText(item, currentLocale, dictionary)),
    nearbyHospitals: lines(property.nearby_hospitals).map((item) => dictionaryText(item, currentLocale, dictionary)),
    nearbySchools: lines(property.nearby_schools).map((item) => dictionaryText(item, currentLocale, dictionary)),
    nearbyParks: lines(property.nearby_parks).map((item) => dictionaryText(item, currentLocale, dictionary)),
    features: lines(features).map((item) => dictionaryText(item, currentLocale, dictionary)),
    structure: dictionaryText(toText(structure), currentLocale, dictionary),
    places: placeItems.map((item: any) => ({ placeId: toText(item.placeId || item.place_id), name: localizedPlaceValue(item, "name", currentLocale), address: localizedPlaceValue(item, "address", currentLocale), mapsUrl: toText(item.googleMapsUrl || item.googleMapsUri || item.google_maps_url || item.google_maps_uri || item.mapsUrl || item.mapsUri || item.url), walkingMinutes: item.walkingMinutes === null || item.walkingMinutes === undefined || item.walkingMinutes === "" ? undefined : Number.isFinite(Number(item.walkingMinutes)) ? Number(item.walkingMinutes) : undefined })),
    sources: { googlePlacesFetchedAt: toText(places?.fetched_at || places?.fetchedAt) || undefined, mlitFetchedAt: toText(parseJson(property.mlit_data)?.fetched_at || parseJson(property.mlit_data)?.fetchedAt) || undefined, dictionaryVersion: toText(dictionaryVersion) || undefined },
  };
}
