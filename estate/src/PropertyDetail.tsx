import React, { useEffect, useState } from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_STATE_KEYS, getPageState, setPageState } from "./types";
import PropertyBasicInfoCard from "./PropertyBasicInfoCard";
import PropertyAddressCard from "./PropertyAddressCard";
import PropertyPriceCard from "./PropertyPriceCard";
import PropertyDetailsCard from "./PropertyDetailsCard";
import PropertyFeaturesCard from "./PropertyFeaturesCard";
import PropertyNeighborhoodCard from "./PropertyNeighborhoodCard";
import PropertyHazardCard from "./PropertyHazardCard";
import PropertyGallerySlider from "./PropertyGallerySlider";
import MapCard from "./MapCard";
import StreetViewCard from "./StreetViewCard";
import Property3DCard from "./Property3DCard";
import { buildEstateMapLinks } from "./utils/propertyDisplay";
import { extractLatLngFromMapUrl } from "./utils/urlBuilders";


const EMPTY_FEATURES: string[] = [];

type DetailGalleryImage = {
  id?: string;
  src?: string;
  image?: string;
  url?: string;
  poster?: string;
  title?: string;
  caption?: string;
  label?: string;
  kind?: string;
  media_type?: string;
};

function normalizeFeatureList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeFeatureList(parsed);
      }
    } catch {
      // Fall through to simple string handling.
    }

    return [trimmed];
  }

  return [];
}

export interface PropertyDetailProps {
  title?: string;
  description?: string;
  image?: string;
  buildingName?: string;

  // Legacy US-centric fields (fallbacks, still supported)
  /** @deprecated Use priceJPY / priceUSD / priceCNY */
  price?: string;
  /** @deprecated Use floorPlan */
  beds?: number;
  /** @deprecated Use floorPlan */
  baths?: number;
  /** Canonical floor area in square metres. */
  sqm?: number;
  /** @deprecated Use sqm or areaSqm */
  sqft?: number;
  /** @deprecated Use tagJP */
  tag?: string;

  // Legacy US address fallback
  address?: string;

  // ── Japan-specific unit fields ──────────────────────────────
  /** Address (Japanese format preferred) */
  addressJP?: string;
  /** Price in JPY: "5,800万円" */
  priceJPY?: string;
  /** Price in USD: "$38,000" */
  priceUSD?: string;
  /** Price in CNY: "280万元" */
  priceCNY?: string;
  /** Tag in Japanese: "売買物件" / "賃貸中" / "成約済" */
  tagJP?: string;
  /** Property type: "sale" | "rent" | "investment" */
  propertyType?: string;
  /** Floor area in ㎡: "65.2㎡" */
  areaSqm?: string;
  /** Tsubo: "19.7坪" */
  tsubo?: string;
  /** Layout/floor plan: "3LDK" / "2DK" / "1R" */
  floorPlan?: string;
  /** Year built (Japanese era optional): "2018年3月" */
  yearBuiltJP?: string;
  /** Deposit: "敷金 100万円" */
  deposit?: string;
  /** Key money / reikin: "礼金 50万円" */
  keyMoney?: string;
  /** Management fee: "管理費 1.5万円/月" */
  managementFee?: string;
  /** Yield: "4.2%" */
  yieldValue?: string;
  /** Maintenance / repair reserve: "修繕積立金 8,000円/月" */
  maintenanceFee?: string;
  /** Pets: "可" / "相談" / "不可" */
  petsAllowed?: string;
  /** Land right: "所有権" / "借地権" */
  landRight?: string;

  // ── Data source fields ──────────────────────────────────────
  area?: string;
  rooms?: string;
  yearBuilt?: string;
  transport?: string;
  features?: string[];
  galleryImages?: Array<string | DetailGalleryImage>;
  items?: any[];
  itemIdKey?: string;
  detailPageId?: string;
  emptyText?: string;
  selectedPropertyIdKey?: string;

  // ── Location / map fields ───────────────────────────────────
  /** Latitude (auto-resolved from items if not set) */
  latitude?: number | string;
  /** Longitude (auto-resolved from items if not set) */
  longitude?: number | string;
  hazardMapUrl?: string;
  nearbyStores?: string;
  nearbyHospitals?: string;
  nearbySchools?: string;
  nearbyParks?: string;
  neighborhoodSummary?: string;

  // ── Loading / error states ──────────────────────────────────
  loading?: boolean;
  error?: { message: string } | null;

  // ── Styling ─────────────────────────────────────────────────
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

function getUrlItemParam(): string {
  if (typeof window === "undefined") return "";
  try {
    return new URLSearchParams(window.location.search).get("item") || "";
  } catch {
    return "";
  }
}

function resolveItem(
  items: any[] | undefined,
  selectedId: string,
  itemIdKey: string
): any | null {
  if (!items || items.length === 0 || !selectedId) return null;
  return (
    items.find(
      (item) =>
        String(item[itemIdKey] ?? item.id ?? item.address ?? "") === selectedId
    ) || null
  );
}

// ── Skeleton loader ──────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-gray-50 via-white to-blue-50 px-5 py-4">
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-72 rounded bg-gray-100" />
      </div>
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-5">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <div className="h-[360px] w-full bg-gray-200" />
            <div className="space-y-3 p-5">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-gray-200" />
                <div className="h-5 w-24 rounded-full bg-gray-100" />
                <div className="h-5 w-32 rounded-full bg-gray-100" />
              </div>
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="h-3 w-12 rounded bg-gray-100" />
                    <div className="mt-2 h-4 w-20 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 border-t border-gray-200 bg-gray-50 p-5 lg:border-l lg:border-t-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="h-3 w-16 rounded bg-gray-100" />
              <div className="mt-2 h-5 w-28 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Error banner ─────────────────────────────────────────────────

function DetailError({
  message,
  onRetry,
  t,
}: {
  message: string;
  onRetry?: () => void;
  t: (k: string) => string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm`}
    >
      <div className="bg-gradient-to-r from-red-50 via-white to-red-50 px-5 py-4">
        <h3 className="text-xl font-semibold text-red-900">
          {t("An error occurred")}
        </h3>
        <p className="mt-1 text-sm text-red-600">{message}</p>
      </div>
      <div className="p-5">
        <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              {t("Retry")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

const PropertyDetail: React.FC<PropertyDetailProps> = ({
  title = "Property Detail",
  description = "Detailed view of the selected property.",
  image,
  buildingName,
  price,
  sqm,
  sqft,
  address,
  tag,
  area,
  rooms,
  yearBuilt,
  transport,
  features,
  galleryImages,
  items,
  itemIdKey = "id",
  detailPageId: _detailPageId,
  emptyText = "物件が選択されていません。",
  selectedPropertyIdKey = ESTATE_STATE_KEYS.selectedPropertyId,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,

  // Japan-specific fields
  addressJP,
  priceJPY,
  priceUSD,
  priceCNY,
  tagJP,
  propertyType,
  areaSqm,
  tsubo,
  floorPlan,
  yearBuiltJP,
  deposit,
  keyMoney,
  managementFee,
  yieldValue,
  maintenanceFee,
  petsAllowed,
  landRight,

  // Location
  latitude,
  longitude,
  hazardMapUrl,
  nearbyStores,
  nearbyHospitals,
  nearbySchools,
  nearbyParks,
  neighborhoodSummary,

  // Loading / error
  loading = false,
  error = null,

  ...restProps
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const stateId = String(getPageState(__stackpage, selectedPropertyIdKey, ""));
  const urlId = getUrlItemParam();
  const selectedId = urlId || stateId;

  // Sync ?item → shared state so sibling components resolve the same property.
  useEffect(() => {
    if (urlId && urlId !== stateId) {
      setPageState(__stackpage, selectedPropertyIdKey, urlId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  // Auto-fetch the property by id when no items[] list is bound (e.g. a detail
  // page opened with only ?item=<property_id>). Uses the public content route.
  const hasBoundItems = Array.isArray(items) && items.length > 0;
  const [fetchedProperty, setFetchedProperty] = useState<any | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const id = selectedId.trim();
    if (!id || hasBoundItems) {
      setFetchedProperty(null);
      setFetchError(null);
      return;
    }
    let cancelled = false;
    setFetchLoading(true);
    setFetchError(null);
    fetch(`/api/estate/properties-public/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        if (cancelled) return;
        const p =
          json?.estateproperties?.[0] || json?.estateproperty || json?.property || null;
        setFetchedProperty(p);
      })
      .catch((e) => {
        if (!cancelled) setFetchError(e?.message || "failed to load property");
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, hasBoundItems]);

  // ── Resolve selected item (bound list match, else the fetched property) ─────
  const effectiveItem = hasBoundItems
    ? resolveItem(items, selectedId, itemIdKey)
    : fetchedProperty;

  const isLoading = loading || (fetchLoading && !effectiveItem);
  const combinedError =
    error || (fetchError && !effectiveItem ? { message: fetchError } : null);

  // ── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return <DetailSkeleton />;
  }

  // ── Error state ────────────────────────────────────────────
  if (combinedError) {
    return (
      <DetailError
        message={combinedError.message || ""}
        t={t}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const resolvedBuildingName =
    effectiveItem?.building_name ??
    effectiveItem?.buildingName ??
    buildingName ??
    title ??
    "";
  // ── Resolve display values (Japan fields first, then legacy fallbacks) ─
  // Primary/feature image: the server-derived `feature_image` (first, is_primary
  // media) is the canonical hero image — matches what the listing card shows.
  const resolvedImage =
    effectiveItem?.feature_image ??
    effectiveItem?.featured_image ??
    effectiveItem?.image ??
    image ??
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  // Japan fields take priority
  const resolvedAddressJP =
    effectiveItem?.addressJP ?? effectiveItem?.address_jp ?? effectiveItem?.address ?? addressJP ?? address ?? "";
  // Price: the record's own columns win over the props, which carry the
  // widget-config preview values (the rule the resolvers above follow too).
  // price_sale is the current asking price; price_valuation is the original
  // appraised price, kept only for the 元価格 → 現行価格 display below.
  // The sale price is read into its own binding so that display never pits a real
  // valuation against the preview amount.
  const recordSalePrice: unknown =
    effectiveItem?.price_sale ??
    effectiveItem?.priceSale ??
    effectiveItem?.salePrice ??
    effectiveItem?.priceJPY ??
    effectiveItem?.price_jpy ??
    effectiveItem?.price;
  // The props are the widget-config preview values and stand in for the empty
  // preview only. With a record in hand its own columns decide: a rent property
  // has no sale price at all, and falling back there would print the sample
  // amount on a rental page instead of leaving the price out.
  const resolvedPriceJPY = recordSalePrice ?? (effectiveItem ? "" : priceJPY ?? price ?? "");
  const resolvedPriceValuation =
    effectiveItem?.price_valuation ??
    effectiveItem?.priceValuation ??
    effectiveItem?.originalPrice ??
    effectiveItem?.original_price ??
    "";
  const resolvedPriceUSD = effectiveItem?.priceUSD ?? effectiveItem?.price_usd ?? priceUSD;
  const resolvedPriceCNY = effectiveItem?.priceCNY ?? effectiveItem?.price_cny ?? priceCNY;
  const resolvedTagJP =
    effectiveItem?.tagJP ?? effectiveItem?.tag_jp ?? tagJP ?? effectiveItem?.tag ?? tag ?? "";
  const resolvedPropertyType =
    effectiveItem?.property_type ?? effectiveItem?.propertyType ?? propertyType ?? "";

  // Parse a JPY amount to yen. Accepts the 万/億 notation the widget defaults and
  // hand-authored props use ("5,800万円" → 58000000) as well as the raw numeric
  // column values, so both sides of the comparison share one unit.
  const priceToNum = (v: unknown) => {
    const s = String(v ?? "").trim();
    if (!s) return 0;
    const n = Number(s.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(n)) return 0;
    if (/億/.test(s)) return n * 100000000;
    if (/万/.test(s)) return n * 10000;
    return n;
  };
  // Format a JPY amount: keep already-formatted strings (¥ / 円 / 万), else
  // prepend ¥ and add thousands separators. Mirrors PropertyCard's formatJpy so
  // the detail page and the cards render the same amount identically.
  const formatJpy = (v?: string | number): string => {
    if (v === undefined || v === null || v === "") return "";
    const s = String(v).trim();
    if (/[¥￥円万]/.test(s)) return s;
    const num = Number(s.replace(/[,\s]/g, ""));
    if (!Number.isFinite(num) || num === 0) return "";
    return `¥${num.toLocaleString("ja-JP")}`;
  };
  const rawSalePrice =
    resolvedPriceJPY === undefined || resolvedPriceJPY === null ? "" : String(resolvedPriceJPY).trim();
  const rawValuationPrice =
    resolvedPriceValuation === undefined || resolvedPriceValuation === null
      ? ""
      : String(resolvedPriceValuation).trim();
  // Falls back to the raw text when it is not a number ("応相談" etc.), so an
  // unparseable price still shows instead of silently disappearing.
  const displayPriceJPY =
    rawSalePrice && rawSalePrice !== "0" ? formatJpy(rawSalePrice) || rawSalePrice : "";
  const isRentProperty = String(resolvedPropertyType || "").toLowerCase() === "rent";
  const salePriceNum = priceToNum(recordSalePrice);
  const valuationPriceNum = priceToNum(resolvedPriceValuation);
  // 元価格 → 現行価格: strike the appraised/original price through above the current
  // price, but only while it is actually higher — that is the whole point, the
  // display is what makes a price reduction visible. With no valuation price there
  // is nothing to compare, so the sale price is shown on its own; the valuation is
  // never rendered as a standalone price.
  const hasPriceReduction =
    !isRentProperty && valuationPriceNum > 0 && salePriceNum > 0 && valuationPriceNum > salePriceNum;
  // Formatted from the raw value, not the parsed number, so a 万/億 amount keeps
  // its original notation instead of degrading to "¥6,200".
  const displayOriginalPriceJPY = hasPriceReduction
    ? formatJpy(rawValuationPrice) || rawValuationPrice
    : "";

  const legacySqft = effectiveItem?.sqft ?? sqft;
  const legacySqm = legacySqft == null || legacySqft === ""
    ? ""
    : `${(Number(legacySqft) * 0.092903).toFixed(1)}㎡`;
  const resolvedAreaSqm =
    effectiveItem?.areaSqm ?? effectiveItem?.area_sqm ?? effectiveItem?.sqm ?? sqm ?? areaSqm ?? area ?? legacySqm;
  const resolvedTsubo = effectiveItem?.tsubo ?? tsubo;
  const resolvedFloorPlan =
    effectiveItem?.floorPlan ?? effectiveItem?.floor_plan ?? floorPlan ?? effectiveItem?.rooms ?? rooms ?? "";
  const resolvedFloorNumber =
    effectiveItem?.floor_number ?? effectiveItem?.floorNumber ?? effectiveItem?.floor_no ?? null;
  const resolvedTotalFloors =
    effectiveItem?.floors_total ?? effectiveItem?.floorsTotal ?? effectiveItem?.total_floors ?? null;
  const resolvedYearBuiltJP =
    effectiveItem?.yearBuiltJP ?? effectiveItem?.year_built_jp ?? yearBuiltJP ?? effectiveItem?.yearBuilt ?? yearBuilt ?? "";
  const resolvedTransport =
    effectiveItem?.transport ?? effectiveItem?.transport_info ?? transport;
  const resolvedDeposit =
    effectiveItem?.deposit ?? deposit;
  const resolvedKeyMoney =
    effectiveItem?.key_money ?? effectiveItem?.keyMoney ?? keyMoney;
  const resolvedManagementFee =
    effectiveItem?.management_fee ?? effectiveItem?.managementFee ?? managementFee;
  const resolvedYield =
    effectiveItem?.yield_percent ?? effectiveItem?.yieldPercent ?? effectiveItem?.yield ?? yieldValue;
  const resolvedMaintenanceFee =
    effectiveItem?.maintenance_fee ?? effectiveItem?.maintenanceFee ?? maintenanceFee;
  const resolvedPetsAllowed =
    effectiveItem?.pets_allowed ?? effectiveItem?.petsAllowed ?? petsAllowed;
  const resolvedLandRight =
    effectiveItem?.land_right ?? effectiveItem?.landRight ?? landRight;
  const resolvedFeatures = normalizeFeatureList(effectiveItem?.features ?? features ?? EMPTY_FEATURES);

  // ── Resolve location for map ───────────────────────────────
  const resolvedLat = latitude ?? effectiveItem?.latitude ?? effectiveItem?.lat ?? null;
  const resolvedLng = longitude ?? effectiveItem?.longitude ?? effectiveItem?.lng ?? null;
  const resolvedHazardMapUrl =
    effectiveItem?.hazard_map_url ??
    hazardMapUrl ??
    "";
  const resolvedNearbyStores =
    effectiveItem?.nearby_stores ??
    nearbyStores ??
    "";
  const resolvedNearbyHospitals =
    effectiveItem?.nearby_hospitals ??
    nearbyHospitals ??
    "";
  const resolvedNearbySchools =
    effectiveItem?.nearby_schools ??
    nearbySchools ??
    "";
  const resolvedNearbyParks =
    effectiveItem?.nearby_parks ??
    nearbyParks ??
    "";
  const resolvedNeighborhoodSummary =
    effectiveItem?.mlit_data ??
    neighborhoodSummary ??
    "";

  // ── Determine layout sections ──────────────────────────────
  const hasContent =
    selectedId || resolvedImage || resolvedPriceJPY || resolvedAddressJP;

  if (!hasContent) {
    return (
      <div
        className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
        style={mergedStyle}
      >
        <h3 className="text-xl font-semibold text-gray-900">{t(title)}</h3>
        <p className="mt-1 break-words text-sm text-gray-600">{t(description)}</p>
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
          <div className="mb-2 text-3xl">🏠</div>
          <p>{t(emptyText)}</p>
          <p className="mt-1 text-xs text-gray-400">
            {t("Select a property from the list")}
          </p>
        </div>
      </div>
    );
  }


  const detailProperty = {
    ...restProps,
    ...(effectiveItem || {}),
    id: effectiveItem?.id ?? selectedId,
    building_name: resolvedBuildingName,
    address: resolvedAddressJP,
    price_jpy: resolvedPriceJPY,
    // The record's own appraisal price, normalized for the child cards so a card
    // that renders the 元価格 → 現行価格 display (the PropertyCard / PropertyTable
    // rule) reads it from the record rather than from the widget preview props.
    // PropertyPriceCard lists the sale price only; it shows no valuation row.
    price_valuation: resolvedPriceValuation,
    price_usd: resolvedPriceUSD,
    price_cny: resolvedPriceCNY,
    tag_jp: resolvedTagJP,
    property_type: resolvedPropertyType,
    area_sqm: resolvedAreaSqm,
    tsubo: resolvedTsubo,
    floor_plan: resolvedFloorPlan,
    floor_number: resolvedFloorNumber,
    floors_total: resolvedTotalFloors,
    year_built_jp: resolvedYearBuiltJP,
    transport_info: resolvedTransport,
    deposit: resolvedDeposit,
    key_money: resolvedKeyMoney,
    management_fee: resolvedManagementFee,
    yieldValue: resolvedYield,
    maintenance_fee: resolvedMaintenanceFee,
    pets_allowed: resolvedPetsAllowed,
    land_right: resolvedLandRight,
    features: resolvedFeatures,
    latitude: resolvedLat,
    longitude: resolvedLng,
    hazard_map_url: resolvedHazardMapUrl,
    nearby_stores: resolvedNearbyStores,
    nearby_hospitals: resolvedNearbyHospitals,
    nearby_schools: resolvedNearbySchools,
    nearby_parks: resolvedNearbyParks,
    neighborhoodSummary: resolvedNeighborhoodSummary,
  };

  // "lat,lng" for the map / street view / 3D cards (empty → they fall back to address).
  const coord =
    resolvedLat != null &&
    resolvedLng != null &&
    String(resolvedLat).trim() &&
    String(resolvedLng).trim()
      ? `${resolvedLat},${resolvedLng}`
      : "";
  // Precise, marker-bearing map links from the places search (address + building),
  // stored on the property. Cards use these for their "open" links; the embed uses
  // the precise coordinate extracted from the map URL (falls back to lat/lng).
  const mapLinks = buildEstateMapLinks(effectiveItem || detailProperty);
  const preciseCoord = extractLatLngFromMapUrl(mapLinks.googleMapUrl) || coord;
  const hasLocation = !!coord || !!resolvedAddressJP || !!mapLinks.googleMapUrl;

  return (
    <div className={`w-full min-w-0 space-y-4 ${className}`} style={mergedStyle}>

      {/* Title banner */}
      <div className={`rounded-2xl px-5 py-4 shadow-sm text-white ${
        resolvedPropertyType === "rent"
          ? "bg-gradient-to-r from-emerald-700 to-emerald-500"
          : resolvedPropertyType === "investment"
          ? "bg-gradient-to-r from-violet-800 to-violet-600"
          : "bg-gradient-to-r from-blue-900 to-blue-700"
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold sm:text-2xl break-words">
              {t(resolvedBuildingName || title)}
            </h2>
            {resolvedAddressJP && (
              <p className="mt-0.5 text-sm opacity-80">{resolvedAddressJP}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {resolvedTagJP && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                {t(resolvedTagJP)}
              </span>
            )}
            {displayPriceJPY && (
              <span className="rounded-full bg-white/25 px-4 py-1.5 text-sm font-bold">
                {displayOriginalPriceJPY && (
                  <span className="mr-2 text-xs font-medium line-through opacity-80">
                    {displayOriginalPriceJPY}
                  </span>
                )}
                {displayPriceJPY}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main image card — full width */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="relative aspect-[16/7] w-full bg-gray-100">
          <img
            src={resolvedImage}
            alt={resolvedAddressJP || resolvedBuildingName || t(title)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
          {resolvedTagJP && (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-gray-800 backdrop-blur-sm">
              {t(resolvedTagJP)}
            </span>
          )}
          {displayPriceJPY && (
            <div className="absolute bottom-4 right-4 rounded-xl bg-rose-600/90 px-4 py-2 text-right text-white shadow-lg backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-rose-100">{t("Price")}</div>
              {displayOriginalPriceJPY && (
                <div className="text-xs font-semibold text-rose-100 line-through">
                  {displayOriginalPriceJPY}
                </div>
              )}
              <div className="text-xl font-bold leading-tight">{displayPriceJPY}</div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery slider — 間取り図・室内写真など (hero image excluded) */}
      <PropertyGallerySlider
        items={[detailProperty]}
        selectedPropertyId={String(detailProperty.id || selectedId || "")}
        excludeImage={resolvedImage}
        title={t("Floor plan and photos")}
        description={t("Review floor plans and room photos in the gallery.")}
      />

      {/* Row 1: Price + Details + Address — 1→2→3 cols */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PropertyPriceCard property={detailProperty} items={[detailProperty]} density="compact" mobileTwoColumn />
        <PropertyDetailsCard property={detailProperty} items={[detailProperty]} density="compact" />
        <PropertyAddressCard property={detailProperty} items={[detailProperty]} density="compact" linkDisplay="button" />
      </div>

      {/* Row 2: BasicInfo + Features — 1→2 cols */}
      <div className="grid gap-4 md:grid-cols-2">
        <PropertyBasicInfoCard
          property={detailProperty} items={[detailProperty]}
          density="compact"
          linkDisplay="chip"
          showPropertyId={false}
          showSource={false}
          showSourceCompany={false}
        />
        <PropertyFeaturesCard property={detailProperty} items={[detailProperty]} density="compact" />
      </div>

      {/* Location: Map / Street View + Access / 3D View — each links out to a full screen */}
      {hasLocation && (
        <div className="space-y-4">
          <MapCard
            title="地図"
            subtitle={resolvedAddressJP || t("You can review a map of the surrounding area.")}
            center={preciseCoord}
            address={resolvedAddressJP}
            mapUrl={mapLinks.googleMapUrl}
            items={[detailProperty]}
            locationLabel={resolvedAddressJP}
          />

          <StreetViewCard
            title="Street View"
            subtitle={resolvedAddressJP || t("Review the streetscape around the property.")}
            viewpoint={preciseCoord}
            address={resolvedAddressJP}
            streetViewUrl={mapLinks.streetViewUrl}
            items={[detailProperty]}
            locationLabel={resolvedAddressJP}
          />

          {resolvedTransport && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {t("Access")}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {t("Access and transportation")}
              </h3>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-700">
                {resolvedTransport}
              </p>
            </div>
          )}

          <Property3DCard
            title="3D View"
            center={preciseCoord}
            address={resolvedAddressJP}
            google3dUrl={mapLinks.google3dUrl}
            items={[detailProperty]}
            locationLabel={resolvedAddressJP}
          />
        </div>
      )}

      {/* Row 3: Neighborhood + Hazard — 1→2 cols */}
      <div className="grid gap-4 md:grid-cols-2">
        <PropertyNeighborhoodCard property={detailProperty} items={[detailProperty]} density="compact" linkDisplay="button" />
        <PropertyHazardCard property={detailProperty} items={[detailProperty]} density="compact" linkDisplay="button" />
      </div>

    </div>
  );
};

export default PropertyDetail;
