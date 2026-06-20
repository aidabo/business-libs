import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_STATE_KEYS, getPageState } from "./types";
import MapCard from "./MapCard";
import StreetViewCard from "./StreetViewCard";


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

function normalizeGalleryImages(
  value: unknown,
  fallbackTitle: string
): Array<{ id: string; src: string; title: string; caption: string }> {
  const items = Array.isArray(value) ? value : [];
  const normalized = items.flatMap((item, index) => {
    if (typeof item === "string") {
      const src = item.trim();
      return src
        ? [{
            id: `gallery-${index}-${src}`,
            src,
            title: index === 0 ? fallbackTitle : `Image ${index + 1}`,
            caption: "",
          }]
        : [];
    }

    if (!item || typeof item !== "object") return [];
    const typed = item as DetailGalleryImage;
    const src =
      typed.src ||
      typed.image ||
      typed.url ||
      typed.poster ||
      "";
    if (!src) return [];
    const title =
      typed.title ||
      typed.caption ||
      typed.label ||
      (typed.kind || typed.media_type ? String(typed.kind || typed.media_type) : "") ||
      (index === 0 ? fallbackTitle : `Image ${index + 1}`);
    return [
      {
        id: typed.id || `gallery-${index}-${src}`,
        src,
        title,
        caption: typed.caption || typed.label || "",
      },
    ];
  });

  const seen = new Set<string>();
  return normalized.filter((item) => {
    if (!item.src || seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
}

function splitMultiline(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n|、|,|，/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function toShortSummary(value: unknown): string {
  if (value && typeof value === "object") {
    try {
      return toShortSummary(JSON.stringify(value));
    } catch {
      return "";
    }
  }
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      const pairs = Object.entries(parsed as Record<string, unknown>)
        .flatMap(([key, entry]) => {
          if (entry == null || entry === "") return [];
          if (Array.isArray(entry)) {
            const joined = entry
              .map((item) => String(item).trim())
              .filter(Boolean)
              .join(" / ");
            return joined ? [`${key}: ${joined}`] : [];
          }
          if (typeof entry === "object") {
            return [`${key}: ${JSON.stringify(entry)}`];
          }
          return [`${key}: ${String(entry)}`];
        });
      if (pairs.length > 0) {
        return pairs.slice(0, 3).join(" ・ ");
      }
    }
  } catch {
    // Keep plain text path below.
  }

  return trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
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
  /** @deprecated Use areaSqm */
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
          {t("エラーが発生しました")}
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
              {t("再試行")}
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
  address,
  beds,
  baths,
  sqft,
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

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return <DetailSkeleton />;
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <DetailError
        message={error?.message || ""}
        t={t}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // ── Resolve selected item ──────────────────────────────────
  const matchedItem = (items && items.length > 0)
    ? resolveItem(items, selectedId, itemIdKey)
    : null;

  const resolvedBuildingName =
    matchedItem?.building_name ??
    matchedItem?.buildingName ??
    buildingName ??
    title ??
    "";
  // ── Resolve display values (Japan fields first, then legacy fallbacks) ─
  const resolvedImage =
    matchedItem?.image ?? matchedItem?.featured_image ?? image ??
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  // Japan fields take priority
  const resolvedAddressJP =
    matchedItem?.addressJP ?? matchedItem?.address_jp ?? matchedItem?.address ?? addressJP ?? address ?? "";
  const resolvedPriceJPY =
    matchedItem?.priceJPY ?? matchedItem?.price_jpy ?? priceJPY ?? matchedItem?.price ?? price ?? "";
  const resolvedPriceUSD = matchedItem?.priceUSD ?? matchedItem?.price_usd ?? priceUSD;
  const resolvedPriceCNY = matchedItem?.priceCNY ?? matchedItem?.price_cny ?? priceCNY;
  const resolvedTagJP =
    matchedItem?.tagJP ?? matchedItem?.tag_jp ?? tagJP ?? matchedItem?.tag ?? tag ?? "";
  const resolvedPropertyType =
    matchedItem?.property_type ?? matchedItem?.propertyType ?? propertyType ?? "";
  const resolvedAreaSqm =
    matchedItem?.areaSqm ?? matchedItem?.area_sqm ?? areaSqm ?? matchedItem?.area ?? area ?? "";
  const resolvedTsubo = matchedItem?.tsubo ?? tsubo;
  const resolvedFloorPlan =
    matchedItem?.floorPlan ?? matchedItem?.floor_plan ?? floorPlan ?? matchedItem?.rooms ?? rooms ?? "";
  const resolvedFloorNumber =
    matchedItem?.floor_number ?? matchedItem?.floorNumber ?? matchedItem?.floor_no ?? null;
  const resolvedTotalFloors =
    matchedItem?.floors_total ?? matchedItem?.floorsTotal ?? matchedItem?.total_floors ?? null;
  const resolvedYearBuiltJP =
    matchedItem?.yearBuiltJP ?? matchedItem?.year_built_jp ?? yearBuiltJP ?? matchedItem?.yearBuilt ?? yearBuilt ?? "";
  const resolvedTransport =
    matchedItem?.transport ?? matchedItem?.transport_info ?? transport;
  const resolvedDeposit =
    matchedItem?.deposit ?? deposit;
  const resolvedKeyMoney =
    matchedItem?.key_money ?? matchedItem?.keyMoney ?? keyMoney;
  const resolvedManagementFee =
    matchedItem?.management_fee ?? matchedItem?.managementFee ?? managementFee;
  const resolvedYield =
    matchedItem?.yield_percent ?? matchedItem?.yieldPercent ?? matchedItem?.yield ?? yieldValue;
  const resolvedMaintenanceFee =
    matchedItem?.maintenance_fee ?? matchedItem?.maintenanceFee ?? maintenanceFee;
  const resolvedPetsAllowed =
    matchedItem?.pets_allowed ?? matchedItem?.petsAllowed ?? petsAllowed;
  const resolvedLandRight =
    matchedItem?.land_right ?? matchedItem?.landRight ?? landRight;
  const resolvedFeatures = normalizeFeatureList(matchedItem?.features ?? features ?? EMPTY_FEATURES);
  const resolvedBeds = matchedItem?.beds ?? beds;
  const resolvedBaths = matchedItem?.baths ?? baths;
  const resolvedSqft = matchedItem?.sqft ?? sqft;

  // ── Resolve location for map ───────────────────────────────
  const resolvedLat = latitude ?? matchedItem?.latitude ?? matchedItem?.lat ?? null;
  const resolvedLng = longitude ?? matchedItem?.longitude ?? matchedItem?.lng ?? null;
  const resolvedCenter = (resolvedLat != null && resolvedLng != null)
    ? `${resolvedLat},${resolvedLng}`
    : "";
  const resolvedAddress = resolvedAddressJP || "";
  const resolvedHazardMapUrl =
    matchedItem?.hazard_map_url ??
    hazardMapUrl ??
    "";
  const resolvedNearbyStores =
    matchedItem?.nearby_stores ??
    nearbyStores ??
    "";
  const resolvedNearbyHospitals =
    matchedItem?.nearby_hospitals ??
    nearbyHospitals ??
    "";
  const resolvedNearbySchools =
    matchedItem?.nearby_schools ??
    nearbySchools ??
    "";
  const resolvedNearbyParks =
    matchedItem?.nearby_parks ??
    nearbyParks ??
    "";
  const resolvedNeighborhoodSummary =
    matchedItem?.mlit_data ??
    neighborhoodSummary ??
    "";
  const galleryItems = normalizeGalleryImages(
    galleryImages ??
      matchedItem?.galleryImages ??
      matchedItem?.gallery_images ??
      matchedItem?.socialMediaAssets ??
      matchedItem?.media ??
      [],
    resolvedBuildingName || t(title)
  );
  const secondaryGalleryItems = galleryItems.filter((item) => item.src !== resolvedImage);

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
        <p className="mt-1 text-sm text-gray-600">{t(description)}</p>
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
          <div className="mb-2 text-3xl">🏠</div>
          <p>{t(emptyText)}</p>
          <p className="mt-1 text-xs text-gray-400">
            {t("一覧から物件を選択してください")}
          </p>
        </div>
      </div>
    );
  }

  // Japan-specific detail rows (always shown for JP data)
  const japanPrimaryFields: Array<{ label: string; value: string | undefined | null }> = [
    ...(resolvedAreaSqm ? [{ label: "専有面積", value: resolvedAreaSqm }] : []),
    ...(resolvedTsubo ? [{ label: "坪数", value: resolvedTsubo }] : []),
    ...(resolvedFloorPlan ? [{ label: "間取り", value: resolvedFloorPlan }] : []),
    ...(resolvedFloorNumber != null ? [{ label: "所在階", value: `${resolvedFloorNumber}階` }] : []),
    ...(resolvedTotalFloors != null ? [{ label: "総階数", value: `${resolvedTotalFloors}階建` }] : []),
    ...(resolvedYearBuiltJP ? [{ label: "築年月", value: resolvedYearBuiltJP }] : []),
  ];

  const japanDetailFields: Array<{ label: string; value: string | undefined | null }> = [
    ...(resolvedTransport ? [{ label: "交通", value: resolvedTransport }] : []),
    ...(resolvedLandRight ? [{ label: "権利", value: resolvedLandRight }] : []),
    ...(resolvedPetsAllowed ? [{ label: "ペット", value: resolvedPetsAllowed }] : []),
  ];

  // Rent-specific fields
  const rentFields: Array<{ label: string; value: string | undefined | null }> = [
    ...(resolvedDeposit ? [{ label: "敷金", value: resolvedDeposit }] : []),
    ...(resolvedKeyMoney ? [{ label: "礼金", value: resolvedKeyMoney }] : []),
    ...(resolvedManagementFee ? [{ label: "管理費", value: resolvedManagementFee }] : []),
    ...(resolvedMaintenanceFee ? [{ label: "修繕積立金", value: resolvedMaintenanceFee }] : []),
  ];

  const isInvestment = resolvedPropertyType === "investment";

  const featureList =
    resolvedFeatures.length > 0
      ? resolvedFeatures
      : [];
  const nearbyBlocks = [
    { label: "スーパー", value: resolvedNearbyStores },
    { label: "病院", value: resolvedNearbyHospitals },
    { label: "学校", value: resolvedNearbySchools },
    { label: "公園", value: resolvedNearbyParks },
  ].filter((item) => String(item.value || "").trim().length > 0);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
      style={mergedStyle}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              {t("Property overview")}
            </div>
            <h3 className="mt-1 text-2xl font-semibold text-gray-900 sm:text-3xl">
              {t(resolvedBuildingName || title)}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {t(resolvedAddressJP || description)}
            </p>
          </div>
          {resolvedTagJP && (
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white ${
              resolvedPropertyType === "rent"
                ? "bg-emerald-600"
                : resolvedPropertyType === "investment"
                ? "bg-violet-600"
                : "bg-blue-600"
            }`}>
              {t(resolvedTagJP)}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.18fr)_minmax(300px,0.82fr)]">
        {/* Left: Main image + gallery */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-[4/3] w-full bg-gray-100">
                <img
                  src={resolvedImage}
                  alt={resolvedAddressJP || resolvedBuildingName || t(title)}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/35 via-transparent to-transparent" />
                <div className="absolute left-4 top-4">
                  {resolvedTagJP && (
                    <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-gray-800 backdrop-blur-sm">
                      {t(resolvedTagJP)}
                    </span>
                  )}
                </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div className="rounded-2xl bg-white/90 px-4 py-3 backdrop-blur-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {t("Main image")}
                  </div>
                </div>
                {resolvedPriceJPY && (
                  <div className="rounded-2xl bg-rose-600 px-4 py-3 text-right text-white shadow-lg">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100">
                      {t("価格")}
                    </div>
                    <div className="mt-1 text-xl font-bold">
                      {resolvedPriceJPY}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {secondaryGalleryItems.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    {t("Gallery")}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t("間取り図・室内写真などの補足画像です。")}
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                  {secondaryGalleryItems.length}
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:thin] snap-x">
                {secondaryGalleryItems.map((slide) => (
                  <div
                    key={slide.id}
                    className="min-w-[220px] max-w-[220px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm snap-start"
                  >
                    <div className="relative h-[170px]">
                      <img
                        src={slide.src}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/35 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 backdrop-blur-sm">
                          {t(slide.title)}
                        </div>
                      </div>
                    </div>
                    {slide.caption && (
                      <div className="px-4 py-3 text-xs text-gray-500">
                        {t(slide.caption)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="space-y-4 p-4 sm:p-5">
              {/* Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {resolvedTagJP && (
                  <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    {t(resolvedTagJP)}
                  </span>
                )}
                {resolvedPriceJPY && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-medium text-amber-800">
                    {resolvedPriceJPY}
                  </span>
                )}
              </div>

              {resolvedNeighborhoodSummary && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500">
                    {t("Overview")}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {t(toShortSummary(resolvedNeighborhoodSummary))}
                  </p>
                </div>
              )}

              {/* Japan primary fields grid */}
              {japanPrimaryFields.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {japanPrimaryFields.map((f) => (
                    <div
                      key={f.label}
                      className="rounded-xl border border-gray-200 bg-white p-3"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {t(f.label)}
                      </div>
                      <div className="mt-1 text-sm font-medium text-gray-900">
                        {f.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(resolvedPriceUSD || resolvedPriceCNY) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  {resolvedPriceUSD && <span>USD {resolvedPriceUSD}</span>}
                  {resolvedPriceCNY && <span>CNY {resolvedPriceCNY}</span>}
                </div>
              )}

              {/* Legacy US fields fallback (only if no JP fields) */}
              {japanPrimaryFields.length === 0 &&
                (resolvedBeds != null || resolvedBaths != null || resolvedSqft != null) && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {resolvedBeds != null && (
                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {t("Beds")}
                      </div>
                      <div className="mt-1 text-sm font-medium text-gray-900">
                        {resolvedBeds}
                      </div>
                    </div>
                  )}
                  {resolvedBaths != null && (
                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {t("Baths")}
                      </div>
                      <div className="mt-1 text-sm font-medium text-gray-900">
                        {resolvedBaths}
                      </div>
                    </div>
                  )}
                  {resolvedSqft != null && (
                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {t("Sqft")}
                      </div>
                      <div className="mt-1 text-sm font-medium text-gray-900">
                        {resolvedSqft}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar: Details */}
        <div className="space-y-4">
          {/* Rent-specific fields */}
          {rentFields.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {t("賃貸条件")}
              </div>
              <div className="mt-3 space-y-2">
                {rentFields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{t(f.label)}</span>
                    <span className="font-medium text-gray-900">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investment yield */}
          {isInvestment && resolvedYield && (
            <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
                {t("投資指標")}
              </div>
              <div className="mt-2 text-2xl font-bold text-violet-700">
                {resolvedYield}
              </div>
            </div>
          )}

          {/* Features */}
          {featureList.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                {t("Features")}
              </div>
              <ul className="mt-3 space-y-2">
                {featureList.map((f: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Japan detail fields */}
          {japanDetailFields.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                {t("Details")}
              </div>
              <div className="mt-3 space-y-2">
                {japanDetailFields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-500">{t(f.label)}</span>
                    <span className="font-medium text-gray-900">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property ID */}
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              {t("Property ID")}
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {selectedId || resolvedAddressJP || t("Not available")}
            </p>
          </div>
        </div>
      </div>

      {/* Hazard + Neighborhood blocks */}
      <div className="grid gap-4 border-t border-gray-200 bg-gray-50 px-5 py-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              {t("Hazard")}
            </div>
            <h4 className="mt-1 text-lg font-semibold text-slate-900">
              {t("ハザード情報")}
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              {t("洪水・土砂災害・津波などの確認に使うブロックです。")}
            </p>
          </div>
          <div className="space-y-3 p-5">
            {resolvedHazardMapUrl ? (
              <a
                href={resolvedHazardMapUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800 transition hover:bg-orange-100"
              >
                {t("ハザードマップを開く")}
              </a>
            ) : (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 px-4 py-3 text-sm text-orange-700">
                {t("ハザードマップURLが未設定です。")}
              </div>
            )}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                {t("補足")}
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {resolvedNeighborhoodSummary
                  ? t(toShortSummary(resolvedNeighborhoodSummary))
                  : t("必要に応じて行政・MLIT情報をここに表示できます。")}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50/80 px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              {t("Nearby")}
            </div>
            <h4 className="mt-1 text-lg font-semibold text-slate-900">
              {t("周辺情報")}
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              {t("生活施設や教育施設など、周辺環境の要点を表示します。")}
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {nearbyBlocks.length > 0 ? nearbyBlocks.map((block) => (
              <div key={block.label} className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500">
                  {t(block.label)}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {splitMultiline(block.value).length > 0 ? splitMultiline(block.value).map((item) => (
                    <span key={item} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
                      {t(item)}
                    </span>
                  )) : (
                    <span className="text-sm font-medium text-slate-900">
                      {t(String(block.value))}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4 text-sm text-blue-700 sm:col-span-2">
                {t("周辺情報が未設定です。")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Auto map & street view section ─────────────────────── */}
      {(resolvedCenter || resolvedAddress) && (
        <div className="grid gap-4 border-t border-gray-200 px-5 py-5 lg:grid-cols-2">
          <MapCard
            center={resolvedCenter || undefined}
            address={resolvedCenter ? undefined : resolvedAddress || undefined}
            zoom={16}
            locationLabel={resolvedAddress}
          />
          <StreetViewCard
            viewpoint={resolvedCenter || undefined}
            address={resolvedCenter ? undefined : resolvedAddress || undefined}
            heading={175}
            pitch={8}
            fov={75}
            locationLabel={resolvedAddress}
          />
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
