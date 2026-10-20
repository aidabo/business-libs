import React from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import MessageDialog from "./MessageDialog";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import type { EstateProperty } from "./types/property";
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
import { resolveEstateProperty } from "./utils/propertyDisplay";

export interface PropertyTableProps {
  properties?: EstateProperty[];
  /** Deprecated (table-era column list). Kept for back-compat; ignored by the
   *  card layout. */
  columns?: string;
  loading?: boolean;
  keywordKey?: string;
  intentKey?: string;
  selectedPropertyIdKey?: string;
  searchableFields?: string[];
  /**
   * Detail page a row click opens — a bare page id/slug OR a full/relative page
   * URL pasted from the detail page's browser bar. Settable from the page-builder
   * UI. When empty, rows do not navigate (selection state + event still fire).
   */
  detailPageId?: string;
  /** Optional per-property-type detail destinations. Empty values fall back to detailPageId. */
  saleDetailPageId?: string;
  rentDetailPageId?: string;
  investmentDetailPageId?: string;
  /**
   * Whether the detail page needs the property's linked Post (lets Post-backed and
   * PropertyDetail-only detail pages coexist):
   *   - `true`  — detail uses a Post; a row with no Post shows a notice instead of
   *               navigating.
   *   - `false` (default) — detail is PropertyDetail-only; navigate with `?item`
   *               even when no Post id is present.
   */
  requirePost?: boolean;
  /** Open the detail page in a new browser window/tab instead of navigating away. */
  openDetailInNewWindow?: boolean;
  /** Show an inquiry-selection checkbox on each row (for bulk InquiryForm). */
  selectable?: boolean;
  inquiryPropertiesKey?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

// ── Image resolution (same rules as PropertyCard) ───────────────────
// The row thumbnail is feature_image → first non-video / non-artifact media.

const isVideoUrl = (u?: string) =>
  /\.(?:mp4|mov|m4v|webm|avi|mkv|ogv|flv|wmv)(?:[?#].*)?$/i.test(String(u || ""));
const isNonMediaUrl = (u?: string) =>
  /\.(?:json|txt|csv|pdf|xml|ya?ml)(?:[?#].*)?$/i.test(String(u || ""));

function resolveRowImage(source: Record<string, any>): string {
  const direct = source.feature_image || source.image || source.featureImage;
  if (direct && !isVideoUrl(direct) && !isNonMediaUrl(direct)) return String(direct);
  const images = source.images;
  if (Array.isArray(images)) {
    for (const entry of images) {
      if (entry && typeof entry === "object") {
        const kind = String(entry.media_type || "").toLowerCase();
        if (kind && !kind.includes("image") && !kind.includes("video")) continue;
      }
      const url =
        typeof entry === "string"
          ? entry
          : entry?.url || entry?.storage_url || entry?.thumbnail_url || "";
      if (url && !isVideoUrl(url) && !isNonMediaUrl(url)) return String(url);
    }
  }
  return "";
}

const toNum = (v: unknown) => {
  const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const TAG_BY_TYPE: Record<string, { label: string; color: string }> = {
  sale: { label: "estate.property.option.type.sale", color: "bg-blue-600" },
  rent: { label: "estate.property.option.type.rent", color: "bg-emerald-600" },
  investment: { label: "estate.property.option.type.investment", color: "bg-violet-600" },
};

function normalizePropertyType(value: unknown): "sale" | "rent" | "investment" | "" {
  const type = String(value ?? "").trim().toLowerCase();
  if (type.includes("rent") || type.includes("賃貸")) return "rent";
  if (type.includes("invest") || type.includes("投資")) return "investment";
  if (type.includes("sale") || type.includes("売買") || type.includes("売却") || type.includes("実需")) return "sale";
  return "";
}

// ── Icons ──────────────────────────────────────────────────────────

const TrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const ImageFallback: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-gray-100 flex flex-col items-center justify-center gap-1.5 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-gray-300">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
    <span className="text-xs font-medium text-gray-400">No Image</span>
  </div>
);

// ── Row skeleton ────────────────────────────────────────────────────

const RowSkeleton: React.FC = () => (
  <div className="flex flex-col sm:flex-row rounded-xl border border-gray-100 bg-white overflow-hidden animate-pulse">
    <div className="w-full sm:w-60 h-44 sm:h-auto sm:min-h-[168px] bg-gray-200" />
    <div className="flex-1 p-5 space-y-3">
      <div className="h-5 w-40 bg-gray-200 rounded" />
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="h-4 w-56 bg-gray-100 rounded" />
      <div className="flex gap-2 pt-1">
        <div className="h-4 w-16 bg-gray-100 rounded" />
        <div className="h-4 w-16 bg-gray-100 rounded" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  </div>
);

// ── One property row (image left / important info right) ────────────

interface PropertyRowProps {
  source: Record<string, any>;
  selected: boolean;
  selectable: boolean;
  selectedForInquiry: boolean;
  navigable: boolean;
  onClick: () => void;
  onToggleSelect: () => void;
}

const PropertyRow: React.FC<PropertyRowProps> = ({
  source,
  selected,
  selectable,
  selectedForInquiry,
  navigable,
  onClick,
  onToggleSelect,
}) => {
  const t = useT();
  const [imgError, setImgError] = React.useState(false);
  const m = resolveEstateProperty(source);
  const image = resolveRowImage(source);
  const showImageFallback = imgError || !image;

  const typeKey = String(m.propertyType || source.property_type || "").toLowerCase();
  const tag =
    TAG_BY_TYPE[typeKey] ||
    (typeKey.includes("rent") || typeKey.includes("賃貸")
      ? TAG_BY_TYPE.rent
      : typeKey.includes("invest") || typeKey.includes("投資")
        ? TAG_BY_TYPE.investment
        : TAG_BY_TYPE.sale);

  const isRent = typeKey.includes("rent") || typeKey.includes("賃貸");
  const priceMain = isRent
    ? m.monthlyRent
      ? `${m.monthlyRent} / 月`
      : m.price || m.salePrice || ""
    : m.salePrice || m.price || "";

  // Show the original/reference amount only when it is higher than the current
  // amount. This supports explicit originalPrice as well as the existing
  // appraisal field used by estate search results.
  const currentPriceNum = toNum(isRent ? m.monthlyRent || m.price || m.salePrice : m.salePrice || m.price);
  const explicitOriginalPrice = source.originalPrice ?? source.original_price ?? source.price_original;
  const valuationNum = toNum(source.price_valuation ?? source.priceValuation);
  const originalPriceNum = toNum(explicitOriginalPrice || (!isRent ? valuationNum : 0));
  const formatTablePrice = (value: unknown) => {
    const text = String(value ?? "").trim();
    if (!text) return "";
    if (/[¥￥円万]/.test(text)) return text;
    const number = toNum(text);
    return number > 0 ? `¥${number.toLocaleString("ja-JP")}` : text;
  };
  const strikePrice =
    originalPriceNum > currentPriceNum && currentPriceNum > 0
      ? formatTablePrice(explicitOriginalPrice || valuationNum)
      : "";

  const title = m.buildingName || m.title || m.address || t("Property");
  const station = (m.nearestStation || m.transportInfo || "").split(/\r?\n/)[0].trim();

  const infoItems: Array<{ label: string; value: string }> = [
    { label: "間取り", value: m.floorPlan || "" },
    { label: "専有面積", value: m.floorArea || "" },
    { label: "所在階", value: m.floorNumber ? `${m.floorNumber}階` : "" },
    { label: "総階数", value: m.totalFloors ? `${m.totalFloors}階建` : "" },
    { label: "築年月", value: m.yearBuilt || "" },
    { label: "構造", value: m.structure || "" },
    { label: "土地面積", value: m.landArea || "" },
    { label: "建物面積", value: m.buildingArea || "" },
  ].filter((item) => item.value);

  return (
    <div
      className={`group flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg ${
        selected ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100 hover:border-gray-200"
      }`}
      onClick={onClick}
    >
      {/* Image (left) */}
      <div className="relative w-full sm:w-60 lg:w-64 h-48 sm:h-auto sm:min-h-[176px] shrink-0 overflow-hidden">
        {showImageFallback ? (
          <ImageFallback className="w-full h-full" />
        ) : (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute top-3 left-3">
          <span className={`${tag.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide`}>
            {t(tag.label)}
          </span>
        </div>
        {selectable && (
          <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              aria-label={t("Select for inquiry")}
              checked={selectedForInquiry}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              className="h-5 w-5 cursor-pointer rounded border-gray-300 bg-white/90 text-blue-600 shadow focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Important info (right) */}
      <div className="flex flex-col flex-1 min-w-0 p-4 sm:p-5 gap-2">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h3>

        {/* Price */}
        <div>
          {strikePrice && (
            <div className="text-xs font-bold text-orange-600 line-through leading-none mb-0.5">{strikePrice}</div>
          )}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-xl font-bold tracking-tight ${strikePrice ? "text-red-600" : "text-gray-900"}`}>
              {priceMain || t("Inquiry")}
            </span>
            {m.yieldValue && (
              <span className="text-sm font-semibold text-emerald-600">
                {t("Yield")} {m.yieldValue}
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        {m.address && (
          <div className="flex items-start gap-1.5 text-sm text-gray-500">
            <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{m.address}</span>
          </div>
        )}

        {/* Station / transport */}
        {station && (
          <div className="flex items-start gap-1.5 text-sm text-gray-500">
            <TrainIcon />
            <span className="line-clamp-1">{station}</span>
          </div>
        )}

        {/* Key facts (building / floors / area / etc.) */}
        {infoItems.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-0.5">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-baseline gap-1 text-sm">
                <span className="text-xs text-gray-400">{t(item.label)}</span>
                <span className="font-medium text-gray-700">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        {m.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {m.features.slice(0, 6).map((feature) => (
              <span
                key={feature}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Summary */}
        {(m.summary || m.description) && (
          <p className="text-sm text-gray-500 line-clamp-2">{m.summary || m.description}</p>
        )}

        {/* Detail affordance */}
        {navigable && (
          <div className="mt-auto pt-2 flex justify-end">
            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
              {t("View details")} →
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────

const PropertyTable: React.FC<PropertyTableProps> = ({
  properties = [],
  loading = false,
  keywordKey = ESTATE_STATE_KEYS.keyword,
  intentKey = ESTATE_STATE_KEYS.filterIntent,
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
  searchableFields = DEFAULT_SEARCHABLE_FIELDS,
  detailPageId,
  saleDetailPageId,
  rentDetailPageId,
  investmentDetailPageId,
  requirePost = false,
  openDetailInNewWindow = true,
  selectable = true,
  inquiryPropertiesKey = ESTATE_STATE_KEYS.inquiryProperties,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();
  const [noPostDialogOpen, setNoPostDialogOpen] = React.useState(false);
  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };

  const keyword = String(getPageState(__stackpage, keywordKey, "")).trim();
  const activeIntent = String(getPageState(__stackpage, intentKey, "all")).toLowerCase();
  const selectedId = String(getPageState(__stackpage, selectedPropertyIdKey, ""));
  const defaultDetailTarget = String(detailPageId || "").trim();

  const detailTargetForProperty = (property: Record<string, any>) => {
    const model = resolveEstateProperty(property);
    const type = normalizePropertyType(model.propertyType || property.property_type || property.propertyType);
    const typeSpecificTarget =
      type === "sale"
        ? saleDetailPageId
        : type === "rent"
          ? rentDetailPageId
          : type === "investment"
            ? investmentDetailPageId
            : "";
    return String(typeSpecificTarget || defaultDetailTarget).trim();
  };

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

  const list: Record<string, any>[] = Array.isArray(properties) ? (properties as any[]) : [];
  const searchQuery = parseSearchQuery(keyword);

  // Same filter pipeline as PropertyGrid / SearchResult: intent → keyword → filters.
  const filtered = list.filter((prop) => {
    if (!propertyMatchesIntent(prop, activeIntent)) return false;
    if (!propertyMatchesSearch(prop, searchQuery, searchableFields)) return false;
    return propertyMatchesDetailFilters(prop, detailFilters);
  });

  // ── Inquiry selection (bulk, binds to InquiryForm via shared state) ──
  const selectedInquiryIds = new Set(
    (selectable ? readInquiryProperties(__stackpage, inquiryPropertiesKey) : []).map((p) => p.id)
  );

  const handleToggleSelect = (prop: Record<string, any>) => {
    const id = String(prop.id || prop.itemId || prop.property_id || prop.address || "");
    if (!id) return;
    const next = toggleInquiryProperty(
      __stackpage,
      {
        id,
        title: String(prop.building_name || prop.buildingName || prop.title || prop.address || id),
        price: String(prop.price ?? prop.price_rent_monthly ?? prop.price_sale ?? ""),
        address: String(prop.address || ""),
      },
      inquiryPropertiesKey
    );
    __stackpage?.emit?.(ESTATE_EVENTS.inquirySelectionChanged, { properties: next });
  };

  const handleRowClick = (prop: Record<string, any>) => {
    const id = prop.id || prop.itemId || prop.property_id || prop.address || "";
    if (__stackpage) {
      const item = { id, price: prop.price, address: prop.address, tag: prop.tag };
      setPageState(__stackpage, selectedPropertyIdKey, item.id);
      __stackpage.emit(ESTATE_EVENTS.propertySelected, buildPropertySelectionEvent(item, "search"));
    }
    const detailTarget = detailTargetForProperty(prop);
    if (detailTarget) {
      const postId = resolvePropertyPostId(prop);
      if (requirePost && !postId) {
        setNoPostDialogOpen(true);
        return;
      }
      const url = buildRealEstateDetailTransitionPath(detailTarget, String(id), "listing-table", postId);
      if (openDetailInNewWindow) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    }
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`w-full space-y-4 ${className}`} style={mergedStyle}>
        {Array.from({ length: 4 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────
  if (filtered.length === 0) {
    return (
      <div className={`w-full ${className}`} style={mergedStyle}>
        {__stackpage && (keyword || activeIntent !== "all") && (
          <div className="mb-4 text-sm text-gray-500">
            {filtered.length} {t("results found")}
            {keyword && <span className="ml-2 text-gray-400">{t("for")} "{keyword}"</span>}
          </div>
        )}
        <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          {t("No properties found.")}
        </div>
      </div>
    );
  }

  // ── List ───────────────────────────────────────────────────────
  return (
    <div className={`w-full ${className}`} style={mergedStyle}>
      {__stackpage && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {t("Showing")} {filtered.length}
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

      <div className="space-y-4">
        {filtered.map((prop, index) => {
          const resolvedItemId = String(prop.id || prop.itemId || prop.property_id || prop.address || index);
          return (
            <PropertyRow
              key={resolvedItemId}
              source={prop}
              selected={!!resolvedItemId && resolvedItemId === selectedId}
              selectable={selectable}
              selectedForInquiry={selectedInquiryIds.has(resolvedItemId)}
              navigable={!!detailTargetForProperty(prop)}
              onClick={() => handleRowClick(prop)}
              onToggleSelect={() => handleToggleSelect(prop)}
            />
          );
        })}
      </div>

      <MessageDialog
        open={noPostDialogOpen}
        title="お知らせ"
        message="この物件の詳細記事は準備中です。しばらくお待ちください。"
        closeLabel="閉じる"
        onClose={() => setNoPostDialogOpen(false)}
      />
    </div>
  );
};

export default PropertyTable;
