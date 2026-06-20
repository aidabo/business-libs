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
  floorPlan?: string;
  minArea?: string | number;
  maxArea?: string | number;
  minYearBuilt?: string | number;
  maxYearBuilt?: string | number;
  petsAllowed?: boolean | null;
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

  const floorPlan = String(filters.floorPlan || "").trim();
  if (floorPlan) {
    const floorPlanHaystack = [
      p.floor_plan,
      p.floorPlan,
      p.layout_description,
    ].filter(Boolean).join(" ");
    if (!includesText(floorPlanHaystack, floorPlan)) return false;
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

  return true;
}
