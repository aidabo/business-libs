import React from "react";
import PropertyCard from "./PropertyCard";
import type { PropertyCardProps } from "./PropertyCard";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import {
  ESTATE_STATE_KEYS,
  getPageState,
  setPageState,
  buildPropertySelectionEvent,
} from "./types";
import {
  DEFAULT_SEARCHABLE_FIELDS,
  parseSearchQuery,
  propertyMatchesDetailFilters,
  propertyMatchesSearch,
  propertyMatchesIntent,
} from "./utils/search";
import { ESTATE_FILTER_STATE_KEYS } from "./PropertyFilterBar";

export interface PropertyGridProps {
  title?: string;
  description?: string;
  properties?: PropertyCardProps[];
  columns?: 2 | 3 | 4;
  layout?: "grid" | "list";
  selectedPropertyIdKey?: string;
  keywordKey?: string;
  intentKey?: string;
  searchableFields?: string[];
  detailPageId?: string;

  // ── Filter / search params ──────────────────────────────────────
  propertyType?: "sale" | "rent" | "investment" | "all";
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  floorPlan?: string;
  location?: string;
  nearestStation?: string;
  limit?: number;
  showPagination?: boolean;

  // ── Styling ──────────────────────────────────────────────────────
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

// ── Main Component ─────────────────────────────────────────────────

const PropertyGrid: React.FC<PropertyGridProps> = ({
  title = "Featured Properties",
  description = "Explore our latest listings chosen for you.",
  properties = [],
  columns = 3,
  layout = "grid",
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
  keywordKey = ESTATE_STATE_KEYS.keyword,
  intentKey = ESTATE_STATE_KEYS.filterIntent,
  searchableFields = DEFAULT_SEARCHABLE_FIELDS,
  detailPageId,

  // Filter params
  propertyType: _propertyType,
  priceMin: _priceMin,
  priceMax: _priceMax,
  areaMin: _areaMin,
  areaMax: _areaMax,
  floorPlan: _floorPlan,
  location: _location,
  nearestStation: _nearestStation,
  limit: _limit = 50,
  showPagination: _showPagination,

  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const keyword = String(getPageState(__stackpage, keywordKey, "")).trim();
  const activeIntent = String(getPageState(__stackpage, intentKey, "all")).toLowerCase();
  const selectedId = String(getPageState(__stackpage, selectedPropertyIdKey, ""));
  const detailFilters = {
    stationKeyword: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.stationKeyword, "") || ""),
    floorPlan: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.floorPlan, "") || ""),
    minArea: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.areaMin, "") || ""),
    maxArea: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.areaMax, "") || ""),
    minYearBuilt: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.yearBuiltMin, "") || ""),
    maxYearBuilt: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.yearBuiltMax, "") || ""),
    petsAllowed: (() => {
      const raw = getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.petsAllowed, null);
      if (raw == null || raw === "") return null;
      return String(raw) === "true" ? true : null;
    })(),
  };

  // ── Display data ───────────────────────────────────────────────
  const displayProperties = Array.isArray(properties) ? (properties as PropertyCardProps[]) : [];
  const searchQuery = parseSearchQuery(keyword);

  const filteredProperties = displayProperties.filter((prop) => {
    const p = prop as Record<string, unknown>;
    if (!propertyMatchesIntent(p, activeIntent)) return false;
    if (!propertyMatchesSearch(p, searchQuery, searchableFields)) return false;
    return propertyMatchesDetailFilters(p, detailFilters);
  });

  // ── Handlers ──────────────────────────────────────────────────
  const handleCardClick = (prop: PropertyCardProps) => {
    if (__stackpage) {
      const itemId = prop.id || prop.itemId || prop.address || "";
      const item = { id: itemId, price: prop.price, address: prop.address, tag: prop.tag };
      setPageState(__stackpage, selectedPropertyIdKey, item.id);
      __stackpage.emit("estate:property:selected", buildPropertySelectionEvent(item));
    }
    if (detailPageId) {
      const id = prop.id || prop.itemId || prop.address || "";
      window.location.href = `/view/${detailPageId}?item=${encodeURIComponent(id)}`;
    }
  };

  // ── Grid classes ──────────────────────────────────────────────
  const gridColsClass: Record<number, string> = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  const isList = layout === "list";

  // ── Render ────────────────────────────────────────────────────
  return (
    <section className={`py-12 bg-gray-50 ${className}`} style={mergedStyle}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t(title)}
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t(description)}
          </p>
          {__stackpage && (
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {t("表示中")} {filteredProperties.length}
              </span>
              {keyword && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {t("キーワード")}: {keyword}
                </span>
              )}
              {activeIntent !== "all" && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {t("条件")}: {t(activeIntent)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Empty state */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {t("物件が見つかりません")}
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              {t("条件を変えて再度お試しください。")}
            </p>
          </div>
        )}

        {/* Property grid */}
        {filteredProperties.length > 0 && (
          <div className={`grid gap-6 ${isList ? "grid-cols-1 max-w-4xl mx-auto" : `grid-cols-1 ${gridColsClass[columns]}`}`}>
            {filteredProperties.map((prop, index) => {
              const resolvedItemId = prop.id || prop.itemId || prop.address || "";
              return (
                <PropertyCard
                  key={resolvedItemId || prop.address || index}
                  {...prop}
                  variant={isList ? "horizontal" : "vertical"}
                  selected={!!resolvedItemId && resolvedItemId === selectedId}
                  onCardClick={() => handleCardClick(prop)}
                  detailPageId={detailPageId}
                  itemId={resolvedItemId}
                  __stackpage={__stackpage}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyGrid;
