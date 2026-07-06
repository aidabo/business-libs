export interface SearchQuery {
  q: string;
  tokens: string[];
  target?: string[];
  intent?: string;
  filters?: string;
}

export const DEFAULT_SEARCHABLE_FIELDS = [
  "address",
  "building_name",
  "city",
  "ward",
  "prefecture",
  "nearest_station",
  "transport_info",
  "floor_plan",
  "layout_description",
  "price",
  "tag",
  "transport",
  "floorPlan",
  "areaSize",
  "expectedRent",
  "yearBuilt",
  "features",
];

const TOKEN_SEPARATORS = /[\s,、　]+/;

export function parseSearchQuery(q: string): SearchQuery {
  const tokens = q
    .split(TOKEN_SEPARATORS)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  return { q, tokens };
}

export function tokenMatchesField(
  token: string,
  fieldValue: unknown
): boolean {
  if (fieldValue == null) return false;
  const str = String(fieldValue).toLowerCase();
  return str.includes(token.toLowerCase());
}

export function propertyMatchesSearch(
  property: Record<string, unknown>,
  query: SearchQuery,
  searchableFields: string[] = DEFAULT_SEARCHABLE_FIELDS
): boolean {
  if (query.tokens.length === 0) return true;
  // No fields to search client-side → don't filter. This is the correct mode
  // when a datasource already performs server-side (keyword) search: an empty
  // `searchableFields` means "server is authoritative", so pass all results
  // through instead of removing everything.
  if (!searchableFields || searchableFields.length === 0) return true;
  return query.tokens.every((token) =>
    searchableFields.some((field) => {
      const value = property[field];
      return tokenMatchesField(token, value);
    })
  );
}

export function propertyMatchesIntent(
  property: Record<string, unknown>,
  activeIntent: string
): boolean {
  if (
    !activeIntent ||
    activeIntent === "all" ||
    activeIntent === ""
  )
    return true;
  const lowered = activeIntent.toLowerCase();
  // Check canonical property_type field (reliable)
  const propType = String(property.property_type ?? "").toLowerCase();
  if (propType === lowered) return true;
  // Fall back to tag matching for backward compatibility with static props
  const tag = String(property.tag ?? "").toLowerCase();
  return tag.includes(lowered);
}

export interface PropertyDetailFilters {
  stationKeyword?: string;
  /** One or more floor plans (comma-separated or array). OR-matched. */
  floorPlan?: string;
  minArea?: string | number;
  maxArea?: string | number;
  minYearBuilt?: string | number;
  maxYearBuilt?: string | number;
  petsAllowed?: boolean | null;
  /** Selected feature/equipment keywords. AND-matched (every one must be present). */
  features?: string[];
  /** Selected facing directions. OR-matched (any one matches). */
  directions?: string[];
}

/** Parse a property's `features` value (JSON string / array / delimited text) into
 *  plain feature strings, dropping embedded image markers and raw URLs. */
function parseFeatureList(value: unknown): string[] {
  let arr: unknown = value;
  if (typeof arr === "string") {
    const text = arr.trim();
    if (!text) return [];
    try {
      arr = JSON.parse(text);
    } catch {
      arr = text.split(/[,、\n]/);
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => String(v ?? "").trim())
    .filter((s) => s && !s.startsWith("__image__:") && !/^https?:\/\//i.test(s));
}

/** Lowercased text of a property's features + equipment-ish fields, for keyword match. */
function buildFeatureHaystack(p: Record<string, any>): string {
  return [
    ...parseFeatureList(p.features),
    p.parking_info,
    p.parkingInfo,
    p.layout_description,
    p.structure,
    p.direction,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function boolTrue(p: Record<string, any>, keys: string[]): boolean {
  return keys.some((k) => {
    const v = p[k];
    return v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";
  });
}

// Special feature keywords that also map to structured/boolean fields (mirrors the
// backend addBooleanFeatureFilter), so a checkbox works even when the raw feature
// text is absent. Everything else falls back to a plain haystack keyword match.
const FEATURE_SPECIAL_MATCHERS: Record<
  string,
  (p: Record<string, any>, haystack: string) => boolean
> = {
  ペット可: (p, h) => boolTrue(p, ["pets_allowed", "petsAllowed"]) || h.includes("ペット"),
  オートロック: (p, h) =>
    boolTrue(p, ["building_auto_lock", "buildingAutoLock"]) || h.includes("オートロック"),
  駐車場: (p, h) =>
    !!String(p.parking_info ?? p.parkingInfo ?? "").trim() || h.includes("駐車場"),
};

function propertyMatchesFeatures(p: Record<string, any>, features: string[]): boolean {
  const wanted = features.map((f) => String(f).trim()).filter(Boolean);
  if (wanted.length === 0) return true;
  const haystack = buildFeatureHaystack(p);
  return wanted.every((f) => {
    const special = FEATURE_SPECIAL_MATCHERS[f];
    if (special) return special(p, haystack);
    return haystack.includes(f.toLowerCase());
  });
}

/** Normalize a facing direction for comparison (drop 向き / separators / spaces). */
function normalizeDirection(value: unknown): string {
  return String(value ?? "")
    .replace(/向き|向|・|\s/g, "")
    .trim();
}

function propertyMatchesDirections(p: Record<string, any>, directions: string[]): boolean {
  const wanted = directions.map(normalizeDirection).filter(Boolean);
  if (wanted.length === 0) return true;
  const dir = normalizeDirection(p.direction ?? p.facing);
  if (!dir) return false;
  return wanted.includes(dir);
}

function toNumberOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(num) ? num : null;
}

function includesText(source: unknown, token: string): boolean {
  if (!token.trim()) return true;
  if (source == null) return false;
  return String(source).toLowerCase().includes(token.toLowerCase());
}

function extractAreaValue(property: Record<string, unknown>): number | null {
  const p = property as Record<string, any>;
  const directCandidates = [
    p.floorArea,
    p.floor_area,
    p.landArea,
    p.land_area,
    p.buildingArea,
    p.building_area,
    p.sqft,
  ];
  for (const candidate of directCandidates) {
    const num = toNumberOrNull(candidate);
    if (num != null) return num;
  }

  const sizeText = String(
    p.areaSize ?? p.floor_area ?? p.land_area ?? p.building_area ?? ""
  ).trim();
  if (!sizeText) return null;
  const match = sizeText.match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : null;
}

function extractYearBuilt(property: Record<string, unknown>): number | null {
  const p = property as Record<string, any>;
  const directCandidates = [p.yearBuiltNum, p.year_built, p.yearBuilt];
  for (const candidate of directCandidates) {
    const num = toNumberOrNull(candidate);
    if (num != null) return num;
  }

  const text = String(p.yearBuilt ?? p.year_built ?? "").trim();
  const match = text.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

function extractBoolean(property: Record<string, unknown>, keys: string[]): boolean | null {
  const p = property as Record<string, any>;
  for (const key of keys) {
    const value = p[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lowered = value.toLowerCase().trim();
      if (lowered === "true" || lowered === "yes" || lowered === "1") return true;
      if (lowered === "false" || lowered === "no" || lowered === "0") return false;
    }
  }
  return null;
}

export function propertyMatchesDetailFilters(
  property: Record<string, unknown>,
  filters: PropertyDetailFilters = {}
): boolean {
  const p = property as Record<string, any>;
  const stationKeyword = String(filters.stationKeyword || "").trim();
  if (stationKeyword) {
    const stationHaystack = [
      p.nearest_station,
      p.transport_info,
      p.transport,
      p.address,
      p.city,
      p.ward,
      p.prefecture,
    ].filter(Boolean).join(" ");
    if (!includesText(stationHaystack, stationKeyword)) return false;
  }

  const floorPlanRaw = String(filters.floorPlan || "").trim();
  if (floorPlanRaw) {
    const floorPlanHaystack = [
      p.floor_plan,
      p.floorPlan,
      p.layout_description,
    ].filter(Boolean).join(" ");
    // Multiple selected floor plans are OR-matched.
    const wantedPlans = floorPlanRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!wantedPlans.some((plan) => includesText(floorPlanHaystack, plan))) return false;
  }

  const area = extractAreaValue(property);
  const minArea = toNumberOrNull(filters.minArea);
  const maxArea = toNumberOrNull(filters.maxArea);
  if (minArea != null && (area == null || area < minArea)) return false;
  if (maxArea != null && (area == null || area > maxArea)) return false;

  const yearBuilt = extractYearBuilt(property);
  const minYearBuilt = toNumberOrNull(filters.minYearBuilt);
  const maxYearBuilt = toNumberOrNull(filters.maxYearBuilt);
  if (minYearBuilt != null && (yearBuilt == null || yearBuilt < minYearBuilt)) return false;
  if (maxYearBuilt != null && (yearBuilt == null || yearBuilt > maxYearBuilt)) return false;

  if (filters.petsAllowed != null) {
    const petsAllowed = extractBoolean(property, ["petsAllowed", "pets_allowed"]);
    if (petsAllowed == null || petsAllowed !== filters.petsAllowed) return false;
  }

  if (filters.features && filters.features.length > 0) {
    if (!propertyMatchesFeatures(p, filters.features)) return false;
  }

  if (filters.directions && filters.directions.length > 0) {
    if (!propertyMatchesDirections(p, filters.directions)) return false;
  }

  return true;
}
