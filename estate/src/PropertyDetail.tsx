import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { ESTATE_STATE_KEYS, getPageState } from "./types";
import PropertyBasicInfoCard from "./PropertyBasicInfoCard";
import PropertyAddressCard from "./PropertyAddressCard";
import PropertyPriceCard from "./PropertyPriceCard";
import PropertyDetailsCard from "./PropertyDetailsCard";
import PropertyFeaturesCard from "./PropertyFeaturesCard";
import PropertyNeighborhoodCard from "./PropertyNeighborhoodCard";
import PropertyHazardCard from "./PropertyHazardCard";


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

  // ── Resolve location for map ───────────────────────────────
  const resolvedLat = latitude ?? matchedItem?.latitude ?? matchedItem?.lat ?? null;
  const resolvedLng = longitude ?? matchedItem?.longitude ?? matchedItem?.lng ?? null;
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
        <p className="mt-1 break-words text-sm text-gray-600">{t(description)}</p>
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


  const detailProperty = {
    ...restProps,
    ...(matchedItem || {}),
    id: matchedItem?.id ?? selectedId,
    building_name: resolvedBuildingName,
    address: resolvedAddressJP,
    price_jpy: resolvedPriceJPY,
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
            {resolvedPriceJPY && (
              <span className="rounded-full bg-white/25 px-4 py-1.5 text-sm font-bold">
                {resolvedPriceJPY}
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
          {resolvedPriceJPY && (
            <div className="absolute bottom-4 right-4 rounded-xl bg-rose-600/90 px-4 py-2 text-right text-white shadow-lg backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-rose-100">{t("価格")}</div>
              <div className="text-xl font-bold leading-tight">{resolvedPriceJPY}</div>
            </div>
          )}
        </div>
        {secondaryGalleryItems.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-t border-gray-100 p-3 [scrollbar-width:thin]">
            {secondaryGalleryItems.map((slide) => (
              <div key={slide.id} className="shrink-0 overflow-hidden rounded-lg border border-gray-100">
                <img src={slide.src} alt={slide.title} className="h-20 w-28 object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 1: Price + Details + Address — 1→2→3 cols */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PropertyPriceCard property={detailProperty} density="compact" mobileTwoColumn />
        <PropertyDetailsCard property={detailProperty} density="compact" />
        <PropertyAddressCard property={detailProperty} density="compact" linkDisplay="button" />
      </div>

      {/* Row 2: BasicInfo + Features — 1→2 cols */}
      <div className="grid gap-4 md:grid-cols-2">
        <PropertyBasicInfoCard
          property={detailProperty}
          density="compact"
          linkDisplay="chip"
          showPropertyId={false}
          showSource={false}
          showSourceCompany={false}
        />
        <PropertyFeaturesCard property={detailProperty} density="compact" />
      </div>

      {/* Row 3: Neighborhood + Hazard — 1→2 cols */}
      <div className="grid gap-4 md:grid-cols-2">
        <PropertyNeighborhoodCard property={detailProperty} density="compact" linkDisplay="button" />
        <PropertyHazardCard property={detailProperty} density="compact" linkDisplay="button" />
      </div>

    </div>
  );
};

export default PropertyDetail;
