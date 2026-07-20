import React from "react";
import PropertyCard, { PropertyCardProps } from "./PropertyCard";
import MessageDialog from "./MessageDialog";
import { useT } from "./hooks/useTranslation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
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

export interface SearchResultProps {
  title?: string;
  results?: PropertyCardProps[];
  totalCount?: number;
  columns?: 2 | 3 | 4;
  keywordKey?: string;
  intentKey?: string;
  selectedPropertyIdKey?: string;
  searchableFields?: string[];
  /**
   * Detail page a card click opens — a bare page id/slug OR a full/relative page
   * URL pasted from the detail page's browser bar. Settable from the page-builder
   * UI. When empty, cards do not navigate (selection state + event still fire).
   */
  detailPageId?: string;
  /**
   * Whether the detail page needs the property's linked Post (lets Post-backed and
   * PropertyDetail-only detail pages coexist):
   *   - `true`  — detail uses a Post; a card with no Post shows a notice instead
   *               of navigating.
   *   - `false` (default) — detail is PropertyDetail-only; navigate with `?item`
   *               even when no Post id is present.
   */
  requirePost?: boolean;
  /** Open the detail page in a new browser window/tab instead of navigating away. */
  openDetailInNewWindow?: boolean;
  /** Show an inquiry-selection checkbox on each card (for bulk InquiryForm). */
  selectable?: boolean;
  inquiryPropertiesKey?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const FALLBACK_RESULTS = Array.from({ length: 9 }, (_, index) => ({
  id: `fallback-property-${index + 1}`,
  itemId: `fallback-property-${index + 1}`,
  image:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  price: "$850,000",
  address: "123 Palm Avenue, Beverly Hills, CA 90210",
  beds: 3,
  baths: 2,
  sqm: 223,
  tag: "FOR SALE",
}));

const SearchResult: React.FC<SearchResultProps> = ({
  title = "Search Results",
  results = [],
  totalCount: _totalCount = 0,
  columns = 3,
  keywordKey = ESTATE_STATE_KEYS.keyword,
  intentKey = ESTATE_STATE_KEYS.filterIntent,
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
  searchableFields = DEFAULT_SEARCHABLE_FIELDS,
  detailPageId,
  requirePost = false,
  openDetailInNewWindow = true,
  // Multi-select inquiry checkbox is ON by default (same as PropertyGrid); set
  // selectable={false} to hide it.
  selectable = true,
  inquiryPropertiesKey = ESTATE_STATE_KEYS.inquiryProperties,
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

  // Sample fallback is ONLY for the design-time preview (component picker, no
  // runtime). In a live page (__stackpage present) an empty `results` — whether a
  // genuine no-match or a brief gap during a Tier B refetch — must NOT swap to
  // hardcoded samples: doing so flips card ids under the inquiry checkboxes and
  // makes check marks appear/disappear. Live empty → the "no properties" state.
  const isPreview = results.length === 0 && !__stackpage;
  const displayResults = isPreview ? FALLBACK_RESULTS : results;

  const searchQuery = parseSearchQuery(keyword);

  // Same filter pipeline as PropertyGrid: intent → keyword search → detail filters.
  const filteredResults = displayResults.filter((prop) => {
    const p = prop as Record<string, unknown>;
    if (!propertyMatchesIntent(p, activeIntent)) return false;
    if (!propertyMatchesSearch(p, searchQuery, searchableFields)) return false;
    return propertyMatchesDetailFilters(p, detailFilters);
  });

  // ── Inquiry selection (bulk, binds to InquiryForm via shared state) ──
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

  const handleCardClick = (prop: PropertyCardProps) => {
    if (__stackpage) {
      const itemId = prop.id || prop.itemId || prop.address || "";
      const item = { id: itemId, price: prop.price, address: prop.address, tag: prop.tag };
      setPageState(__stackpage, selectedPropertyIdKey, item.id);
      __stackpage.emit(ESTATE_EVENTS.propertySelected, buildPropertySelectionEvent(item, "search"));
    }
    if (detailTarget) {
      const id = prop.id || prop.itemId || prop.address || "";
      // Only Post-backed detail pages need the linked Post: when requirePost is
      // set and it's missing (rare), show a notice instead of navigating.
      // PropertyDetail-only pages navigate with just ?item.
      const postId = resolvePropertyPostId(prop);
      if (requirePost && !postId) {
        setNoPostDialogOpen(true);
        return;
      }
      const url = buildRealEstateDetailTransitionPath(
        detailTarget,
        String(id),
        "search",
        postId,
      );
      if (openDetailInNewWindow) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    }
  };

  const gridColsClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className={`py-12 w-full h-full ${className}`} style={mergedStyle}>
      <div className="w-full h-full px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t(title)}</h2>
            <div className="flex items-center text-gray-600">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              <span>
                {filteredResults.length} {t("results found")}
                {keyword && (
                  <span className="ml-2 text-gray-400">
                    {t('for')} "{keyword}"
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {filteredResults.length > 0 ? (
          <div className={`grid grid-cols-1 ${gridColsClass[columns]} gap-8`}>
          {filteredResults.map((prop, index) => {
              const resolvedItemId = prop.id || prop.itemId || prop.address || "";
              return (
                <PropertyCard
                  key={resolvedItemId || index}
                  {...prop}
                  variant="vertical"
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
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">{t("No properties found matching your criteria.")}</p>
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

export default SearchResult;
