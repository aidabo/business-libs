import React from "react";
import PropertyCard, { PropertyCardSkeleton } from "./PropertyCard";
import type { PropertyCardProps } from "./PropertyCard";
import MessageDialog from "./MessageDialog";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import {
  ESTATE_STATE_KEYS,
  ESTATE_EVENTS,
  getPageState,
  setPageState,
  buildPropertySelectionEvent,
  readInquiryProperties,
  toggleInquiryProperty,
} from "./types";
import {
  DEFAULT_SEARCHABLE_FIELDS,
  parseSearchQuery,
  propertyMatchesDetailFilters,
  propertyMatchesSearch,
  propertyMatchesIntent,
} from "./utils/search";
import { ESTATE_FILTER_STATE_KEYS } from "./PropertyFilterBar";
import {
  buildRealEstateDetailTransitionPath,
  resolvePropertyPostId,
} from "./utils/urlBuilders";

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
  /**
   * Detail page a card click opens — a bare page id/slug OR a full/relative page
   * URL pasted from the detail page's browser bar. Settable from the page-builder
   * UI (or bound to page state / a `{{query.*}}` param like any StackPage prop).
   * When empty, cards do not navigate (selection state + event still fire).
   */
  detailPageId?: string;
  /**
   * Whether the detail page needs the property's linked Post. Detail pages come in
   * two shapes and this lets both coexist:
   *   - `true`  — detail uses a Post (PostView + PropertyDetail). A card with no
   *               linked Post can't open it, so a notice is shown instead of navigating.
   *   - `false` (default) — detail uses PropertyDetail only (self-fetches by
   *               `?item`); the Post is optional, so navigation proceeds with just
   *               `?item` when no Post id is present.
   */
  requirePost?: boolean;
  /** Open the detail page in a new browser window/tab instead of navigating away. */
  openDetailInNewWindow?: boolean;
  /** Show an inquiry-selection checkbox on each card (for bulk InquiryForm). */
  selectable?: boolean;
  inquiryPropertiesKey?: string;

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
  requirePost = false,
  openDetailInNewWindow = true,
  // Multi-select inquiry checkbox is ON by default so listing pages get it without
  // per-page config; set selectable={false} to hide it (e.g. related/similar grids).
  selectable = true,
  inquiryPropertiesKey = ESTATE_STATE_KEYS.inquiryProperties,

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
  // Notice shown when a card has no linked Post yet (detail transition needs one).
  const [noPostDialogOpen, setNoPostDialogOpen] = React.useState(false);

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const keyword = String(getPageState(__stackpage, keywordKey, "")).trim();
  const activeIntent = String(getPageState(__stackpage, intentKey, "all")).toLowerCase();
  const selectedId = String(getPageState(__stackpage, selectedPropertyIdKey, ""));
  // Detail target set by the author (id or URL). Empty → cards don't navigate.
  const detailTarget = String(detailPageId || "").trim();
  const detailFilters = {
    stationKeyword: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.stationKeyword, "") || ""),
    floorPlan: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.floorPlan, "") || ""),
    minArea: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.areaMin, "") || ""),
    maxArea: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.areaMax, "") || ""),
    minYearBuilt: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.yearBuiltMin, "") || ""),
    maxYearBuilt: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.yearBuiltMax, "") || ""),
    minPrice: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.priceMin, "") || ""),
    maxPrice: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.priceMax, "") || ""),
    minDeposit: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.depositMin, "") || ""),
    maxDeposit: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.depositMax, "") || ""),
    minKeyMoney: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.keyMoneyMin, "") || ""),
    maxKeyMoney: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.keyMoneyMax, "") || ""),
    minYield: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.yieldMin, "") || ""),
    maxYield: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.yieldMax, "") || ""),
    petsAllowed: (() => {
      const raw = getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.petsAllowed, null);
      if (raw == null || raw === "") return null;
      return String(raw) === "true" ? true : null;
    })(),
    features: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.features, "") || "")
      .split(",").map((s) => s.trim()).filter(Boolean),
    directions: String(getPageState(__stackpage, ESTATE_FILTER_STATE_KEYS.directions, "") || "")
      .split(",").map((s) => s.trim()).filter(Boolean),
  };

  // ── Display data ───────────────────────────────────────────────
  const displayProperties = Array.isArray(properties) ? (properties as PropertyCardProps[]) : [];

  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  React.useEffect(() => {
    if (displayProperties.length > 0) {
      setIsInitialLoading(false);
      return;
    }
    const timer = setTimeout(() => setIsInitialLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [properties]);

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
    if (detailTarget) {
      const id = prop.id || prop.itemId || prop.address || "";
      // The property's linked Post (&post=<post_id>) feeds the detail page's
      // PostView. Only Post-backed detail pages need it: when requirePost is set
      // and the property has no Post (rare), show a notice instead of opening a
      // postless page. PropertyDetail-only pages (requirePost=false) navigate with
      // just ?item. Needs include=posts on the datasource for the Post to resolve.
      const postId = resolvePropertyPostId(prop);
      if (requirePost && !postId) {
        setNoPostDialogOpen(true);
        return;
      }
      const url = buildRealEstateDetailTransitionPath(
        detailTarget,
        String(id),
        "listing-grid",
        postId,
      );
      if (openDetailInNewWindow) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    }
  };

  // ── Inquiry selection (bulk) ──────────────────────────────────
  const selectedInquiryIds = new Set(
    (selectable ? readInquiryProperties(__stackpage, inquiryPropertiesKey) : []).map((p) => p.id)
  );

  const handleToggleSelect = (prop: PropertyCardProps) => {
    const p = prop as Record<string, any>;
    const id = String(prop.id || prop.itemId || p.address || "");
    if (!id) return;
    const next = toggleInquiryProperty(
      __stackpage,
      {
        id,
        title: String(p.building_name || p.buildingName || p.title || p.address || id),
        price: String(p.price ?? p.price_rent_monthly ?? p.price_sale ?? ""),
        address: String(p.address || ""),
      },
      inquiryPropertiesKey
    );
    __stackpage?.emit?.(ESTATE_EVENTS.inquirySelectionChanged, { properties: next });
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
              {t("Showing")} {filteredProperties.length}
              </span>
              {keyword && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {t("Keyword")}: {keyword}
                </span>
              )}
              {activeIntent !== "all" && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {t("Criteria")}: {t(activeIntent)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {isInitialLoading && displayProperties.length === 0 && !!__stackpage && (
          <div className={`grid gap-6 ${isList ? "grid-cols-1 max-w-4xl mx-auto" : `grid-cols-1 ${gridColsClass[columns]}`}`}>
            {Array.from({ length: columns * 2 }).map((_, i) => (
              <PropertyCardSkeleton key={i} variant={isList ? "horizontal" : "vertical"} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isInitialLoading && filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {t("No properties found")}
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              {t("Try changing your criteria and search again.")}
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
                  detailPageId={detailTarget}
                  itemId={resolvedItemId}
                  selectable={selectable}
                  selectedForInquiry={selectedInquiryIds.has(resolvedItemId)}
                  onToggleSelect={() => handleToggleSelect(prop)}
                  __stackpage={__stackpage}
                />
              );
            })}
          </div>
        )}
      </div>

      <MessageDialog
        open={noPostDialogOpen}
        title="お知らせ"
        message="この物件の詳細記事は準備中です。しばらくお待ちください。"
        closeLabel="閉じる"
        onClose={() => setNoPostDialogOpen(false)}
      />
    </section>
  );
};

export default PropertyGrid;
