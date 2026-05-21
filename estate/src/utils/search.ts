export interface SearchQuery {
  q: string;
  tokens: string[];
  target?: string[];
  intent?: string;
  filters?: string;
}

export const DEFAULT_SEARCHABLE_FIELDS = [
  "address",
  "price",
  "tag",
  "transport",
  "floorPlan",
  "areaSize",
  "expectedRent",
  "yearBuilt",
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
