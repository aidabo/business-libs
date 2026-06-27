export type FieldRow = {
  key: string;
  label: string;
  value: string;
  href?: string;
};

export type EstatePropertyDisplayInput = Record<string, any>;

export type EstatePropertyDisplayModel = {
  id?: string;
  buildingName?: string;
  title?: string;
  summary?: string;
  description?: string;
  address?: string;
  propertyType?: string;
  status?: string;
  source?: string;
  sourceCompany?: string;
  nearestStation?: string;
  transportInfo?: string;
  latitude?: number | string;
  longitude?: number | string;
  googleMapUrl?: string;
  google3dUrl?: string;
  streetViewUrl?: string;
  price?: string;
  salePrice?: string;
  monthlyRent?: string;
  deposit?: string;
  keyMoney?: string;
  managementFee?: string;
  maintenanceFee?: string;
  yieldValue?: string;
  floorPlan?: string;
  floorArea?: string;
  landArea?: string;
  buildingArea?: string;
  floorNumber?: string;
  totalFloors?: string;
  yearBuilt?: string;
  structure?: string;
  landRight?: string;
  features: string[];
  neighborhoodSummary?: string;
  nearbyStores?: string;
  nearbyHospitals?: string;
  nearbySchools?: string;
  nearbyParks?: string;
  hazardMapUrl?: string;
  hazardSummary?: string;
  floodRisk?: string;
  landslideRisk?: string;
  tsunamiRisk?: string;
  raw: Record<string, any>;
};

export type EstateFieldGroups = {
  basic: FieldRow[];
  address: FieldRow[];
  price: FieldRow[];
  details: FieldRow[];
  features: FieldRow[];
  neighborhood: FieldRow[];
  hazard: FieldRow[];
};

const EMPTY_MODEL: EstatePropertyDisplayModel = {
  features: [],
  raw: {},
};

function isPresent(value: unknown): boolean {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function firstValue(source: Record<string, any>, keys: string[]): any {
  for (const key of keys) {
    const value = source?.[key];
    if (isPresent(value)) return value;
  }
  return undefined;
}

function stringify(value: unknown): string {
  if (!isPresent(value)) return "";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "あり" : "なし";
  if (Array.isArray(value)) return value.map(stringify).filter(Boolean).join(" / ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value).trim();
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(stringify).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return normalizeList(parsed);
    } catch {
      // Plain string below.
    }
    return trimmed
      .split(/\r?\n|、|,|，/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function formatMoney(value: unknown): string {
  if (!isPresent(value)) return "";
  if (typeof value === "number") return `¥${value.toLocaleString("ja-JP")}`;
  return stringify(value);
}

function formatArea(value: unknown): string {
  if (!isPresent(value)) return "";
  if (typeof value === "number") return `${value.toLocaleString("ja-JP")}㎡`;
  const text = stringify(value);
  return /㎡|坪|m2|m²/i.test(text) ? text : `${text}㎡`;
}

function coordPair(input: Record<string, any>): string {
  const lat = firstValue(input, ["latitude", "lat"]);
  const lng = firstValue(input, ["longitude", "lng", "lon"]);
  return isPresent(lat) && isPresent(lng) ? `${lat},${lng}` : "";
}

export function buildEstateMapLinks(property: any): { googleMapUrl?: string; google3dUrl?: string; streetViewUrl?: string } {
  const source = property && typeof property === "object" ? property : {};
  const address = stringify(firstValue(source, ["google_map_address", "addressJP", "address_jp", "address"]));
  const coords = coordPair(source);
  const providedMap = stringify(firstValue(source, ["google_map_url", "googleMapUrl", "map_url", "mapUrl"]));
  const provided3d = stringify(firstValue(source, ["google_3d_url", "google3dUrl", "google3DUrl"]));
  const providedStreet = stringify(firstValue(source, ["street_view_url", "streetViewUrl", "streetview_url"]));

  const googleMapUrl = providedMap || (coords ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords)}` : address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : undefined);
  const streetViewUrl = providedStreet || (coords ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${encodeURIComponent(coords)}` : address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&layer=c` : undefined);

  return {
    googleMapUrl,
    google3dUrl: provided3d || undefined,
    streetViewUrl,
  };
}

export function resolveSelectedEstateProperty(props: {
  property?: any;
  items?: any[];
  selectedPropertyId?: string;
  selectedPropertyIdKey?: string;
  itemIdKey?: string;
}): any | null {
  if (props.property && typeof props.property === "object") return props.property;
  const selectedId = stringify(props.selectedPropertyId);
  const items = Array.isArray(props.items) ? props.items : [];
  if (!selectedId || items.length === 0) return null;
  const itemIdKey = props.itemIdKey || "id";
  return items.find((item) => {
    if (!item || typeof item !== "object") return false;
    return [item[itemIdKey], item.id, item.itemId, item.property_id, item.address, item.building_name]
      .some((candidate) => stringify(candidate) === selectedId);
  }) || null;
}

export function resolveEstateProperty(input: EstatePropertyDisplayInput = {}): EstatePropertyDisplayModel {
  const selected = resolveSelectedEstateProperty(input);
  const source = selected ? { ...input, ...selected } : input;
  if (!source || typeof source !== "object") return EMPTY_MODEL;
  const mapLinks = buildEstateMapLinks(source);

  const features = [
    ...normalizeList(firstValue(source, ["features", "equipment", "amenities"])),
    ...["auto_lock", "delivery_box", "parking_available", "pets_allowed", "internet_available", "bath_dryer", "floor_heating"]
      .filter((key) => source[key] === true)
      .map((key) => ({
        auto_lock: "オートロック",
        delivery_box: "宅配ボックス",
        parking_available: "駐車場あり",
        pets_allowed: "ペット相談可",
        internet_available: "インターネット対応",
        bath_dryer: "浴室乾燥機",
        floor_heating: "床暖房",
      }[key] || key)),
  ];

  return {
    id: stringify(firstValue(source, ["id", "property_id", "itemId"])) || undefined,
    buildingName: stringify(firstValue(source, ["building_name", "buildingName", "title", "name"])) || undefined,
    title: stringify(firstValue(source, ["title", "building_name", "buildingName", "name"])) || undefined,
    summary: stringify(firstValue(source, ["summary", "description", "neighborhoodSummary", "mlit_data"])) || undefined,
    description: stringify(firstValue(source, ["description", "comment", "remarks", "summary"])) || undefined,
    address: stringify(firstValue(source, ["addressJP", "address_jp", "address", "locationLabel"])) || undefined,
    propertyType: stringify(firstValue(source, ["property_type", "propertyType", "kind", "tag", "tagJP", "tag_jp"])) || undefined,
    status: stringify(firstValue(source, ["status", "publication_status"])) || undefined,
    source: stringify(firstValue(source, ["source", "data_source"])) || undefined,
    sourceCompany: stringify(firstValue(source, ["source_company", "sourceCompany", "company_name"])) || undefined,
    nearestStation: stringify(firstValue(source, ["nearest_station", "nearestStation", "station"])) || undefined,
    transportInfo: stringify(firstValue(source, ["transport_info", "transportInfo", "transport", "access"])) || undefined,
    latitude: firstValue(source, ["latitude", "lat"]),
    longitude: firstValue(source, ["longitude", "lng", "lon"]),
    ...mapLinks,
    price: formatMoney(firstValue(source, ["priceJPY", "price_jpy", "price", "price_sale", "priceSale", "salePrice"])),
    salePrice: formatMoney(firstValue(source, ["price_sale", "priceSale", "salePrice", "priceJPY", "price_jpy"])),
    monthlyRent: formatMoney(firstValue(source, ["price_rent_monthly", "priceRentMonthly", "monthlyRent", "current_rent"])),
    deposit: formatMoney(firstValue(source, ["price_deposit", "deposit", "priceDeposit"])),
    keyMoney: formatMoney(firstValue(source, ["price_key_money", "key_money", "keyMoney", "priceKeyMoney"])),
    managementFee: formatMoney(firstValue(source, ["price_management_fee", "management_fee", "managementFee"])),
    maintenanceFee: formatMoney(firstValue(source, ["price_maintenance_fee", "maintenance_fee", "maintenanceFee"])),
    yieldValue: stringify(firstValue(source, ["yieldValue", "yield_value", "yield_percent", "yieldPercent", "yield"])),
    floorPlan: stringify(firstValue(source, ["floor_plan", "floorPlan", "rooms"])),
    floorArea: formatArea(firstValue(source, ["floor_area", "floorArea", "areaSqm", "area_sqm", "area"])),
    landArea: formatArea(firstValue(source, ["land_area", "landArea"])),
    buildingArea: formatArea(firstValue(source, ["building_area", "buildingArea"])),
    floorNumber: stringify(firstValue(source, ["floor_number", "floorNumber", "floor_no"])),
    totalFloors: stringify(firstValue(source, ["floors_total", "floorsTotal", "total_floors"])),
    yearBuilt: stringify(firstValue(source, ["year_built", "yearBuilt", "yearBuiltJP", "year_built_jp"])),
    structure: stringify(firstValue(source, ["structure", "building_structure"])),
    landRight: stringify(firstValue(source, ["land_right", "landRight"])),
    features: Array.from(new Set(features)),
    neighborhoodSummary: stringify(firstValue(source, ["neighborhoodSummary", "neighborhood_summary", "mlit_data", "area_summary"])),
    nearbyStores: stringify(firstValue(source, ["nearbyStores", "nearby_stores", "stores"])),
    nearbyHospitals: stringify(firstValue(source, ["nearbyHospitals", "nearby_hospitals", "hospitals"])),
    nearbySchools: stringify(firstValue(source, ["nearbySchools", "nearby_schools", "schools"])),
    nearbyParks: stringify(firstValue(source, ["nearbyParks", "nearby_parks", "parks"])),
    hazardMapUrl: stringify(firstValue(source, ["hazardMapUrl", "hazard_map_url"])),
    hazardSummary: stringify(firstValue(source, ["hazardSummary", "hazard_summary", "disaster_notes", "hazard_notes"])),
    floodRisk: stringify(firstValue(source, ["floodRisk", "flood_risk"])),
    landslideRisk: stringify(firstValue(source, ["landslideRisk", "landslide_risk"])),
    tsunamiRisk: stringify(firstValue(source, ["tsunamiRisk", "tsunami_risk"])),
    raw: source,
  };
}

function row(key: string, label: string, value: unknown, href?: string): FieldRow[] {
  const text = stringify(value);
  return text ? [{ key, label, value: text, href }] : [];
}

export function getEstateFieldGroups(property: EstatePropertyDisplayModel): EstateFieldGroups {
  return {
    basic: [
      ...row("id", "物件ID", property.id),
      ...row("buildingName", "建物名", property.buildingName || property.title),
      ...row("propertyType", "種別", property.propertyType),
      ...row("status", "ステータス", property.status),
      ...row("source", "ソース", property.source),
      ...row("sourceCompany", "提供会社", property.sourceCompany),
      ...row("summary", "概要", property.summary || property.description),
    ],
    address: [
      ...row("address", "住所", property.address, property.googleMapUrl),
      ...row("nearestStation", "最寄駅", property.nearestStation),
      ...row("transportInfo", "交通", property.transportInfo),
      ...row("googleMapUrl", "Google Map", property.googleMapUrl, property.googleMapUrl),
      ...row("google3dUrl", "Google 3D", property.google3dUrl, property.google3dUrl),
      ...row("streetViewUrl", "Street View", property.streetViewUrl, property.streetViewUrl),
    ],
    price: [
      ...row("price", "価格", property.price),
      ...row("salePrice", "売買価格", property.salePrice),
      ...row("monthlyRent", "月額賃料", property.monthlyRent),
      ...row("deposit", "敷金", property.deposit),
      ...row("keyMoney", "礼金", property.keyMoney),
      ...row("managementFee", "管理費", property.managementFee),
      ...row("maintenanceFee", "修繕積立金", property.maintenanceFee),
      ...row("yieldValue", "利回り", property.yieldValue),
    ],
    details: [
      ...row("floorPlan", "間取り", property.floorPlan),
      ...row("floorArea", "専有面積", property.floorArea),
      ...row("landArea", "土地面積", property.landArea),
      ...row("buildingArea", "建物面積", property.buildingArea),
      ...row("floorNumber", "所在階", property.floorNumber ? `${property.floorNumber}階` : ""),
      ...row("totalFloors", "総階数", property.totalFloors ? `${property.totalFloors}階建` : ""),
      ...row("yearBuilt", "築年月", property.yearBuilt),
      ...row("structure", "構造", property.structure),
      ...row("landRight", "権利", property.landRight),
    ],
    features: property.features.map((value, index) => ({ key: `feature-${index}`, label: "特徴・設備", value })),
    neighborhood: [
      ...row("neighborhoodSummary", "周辺概要", property.neighborhoodSummary),
      ...row("nearbyStores", "スーパー", property.nearbyStores),
      ...row("nearbyHospitals", "病院", property.nearbyHospitals),
      ...row("nearbySchools", "学校", property.nearbySchools),
      ...row("nearbyParks", "公園", property.nearbyParks),
      ...row("googleMapUrl", "Google Map", property.googleMapUrl, property.googleMapUrl),
    ],
    hazard: [
      ...row("hazardMapUrl", "ハザードマップ", property.hazardMapUrl, property.hazardMapUrl),
      ...row("hazardSummary", "災害メモ", property.hazardSummary),
      ...row("floodRisk", "洪水", property.floodRisk),
      ...row("landslideRisk", "土砂災害", property.landslideRisk),
      ...row("tsunamiRisk", "津波", property.tsunamiRisk),
    ],
  };
}
