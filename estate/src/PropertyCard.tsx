import { useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import {
  ESTATE_STATE_KEYS,
  ESTATE_EVENTS,
  buildPropertySelectionEvent,
  setPageState,
} from "./types";

// ── Skeleton loader ─────────────────────────────────────────────────

export const PropertyCardSkeleton: React.FC<{ variant?: "vertical" | "horizontal" }> = ({
  variant = "vertical",
}) => {
  if (variant === "horizontal") {
    return (
      <div className="flex flex-col sm:flex-row h-full sm:h-48 rounded-xl border border-gray-100 bg-white overflow-hidden animate-pulse">
        <div className="relative w-full sm:w-2/5 h-48 sm:h-full bg-gray-200" />
        <div className="flex-1 p-4 space-y-3">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
        <div className="h-4 w-36 bg-gray-100 rounded" />
        <div className="flex gap-2 pt-2 border-t border-gray-50">
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
};

// ── Image error fallback ────────────────────────────────────────────

const PropertyImageFallback: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-gray-100 flex flex-col items-center justify-center gap-1.5 ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-300">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
    <span className="text-sm font-medium text-gray-400">No Image</span>
  </div>
);

// ── Props ──────────────────────────────────────────────────────────

/** A property media item (from estate_property_media + social_media_assets). */
export interface PropertyMediaItem {
  url?: string;
  storage_url?: string;
  thumbnail_url?: string;
  /** Poster image for a video entry (null when none). */
  poster?: string | null;
  caption?: string;
  is_primary?: boolean;
  media_type?: string;
  /** True when `url` points at a video (card shows the poster + a play badge). */
  is_video?: boolean;
  sort_order?: number;
}

export interface PropertyCardProps {
  id?: string;
  image?: string;
  /** Card image URL derived server-side (first/main image). */
  feature_image?: string;
  /** All property media; images[0] is the main image shown on the card. */
  images?: Array<PropertyMediaItem | string>;
  price?: string;
  price_jpy?: string | number;
  price_sale?: string | number;
  price_rent_monthly?: string | number;
  originalPrice?: string;
  address?: string;
  buildingName?: string;
  nearestStation?: string;
  transportInfo?: string;
  building_name?: string;
  nearest_station?: string;
  transport_info?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  tag?: string;
  transport?: string;
  floorPlan?: string;
  floor_plan?: string;
  areaSize?: string;
  expectedRent?: string;
  yearBuilt?: string;
  floorAreaNum?: number;
  landAreaNum?: number;
  buildingAreaNum?: number;
  yearBuiltNum?: number;
  floor_area?: number;
  land_area?: number;
  building_area?: number;
  year_built?: number;
  petsAllowed?: boolean;
  pets_allowed?: boolean;
  buildingAutoLock?: boolean;
  building_auto_lock?: boolean;
  deliveryBox?: boolean;
  features?: string[] | string;
  property_type?: string;
  variant?: "vertical" | "horizontal";
  selected?: boolean;
  onCardClick?: () => void;
  detailPageId?: string;
  itemId?: string;
  /** Show an inquiry-selection checkbox on the card. */
  selectable?: boolean;
  selectedForInquiry?: boolean;
  onToggleSelect?: () => void;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

// ── Icons ──────────────────────────────────────────────────────────

const TrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);


const normalizeFeatureList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return normalizeFeatureList(parsed);
    } catch {
      // Plain comma/newline separated text below.
    }
    return trimmed
      .split(/\r?\n|、|,|，/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// ── Main Component ─────────────────────────────────────────────────

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  image: imageProp,
  feature_image,
  images,
  price: priceProp,
  price_jpy,
  price_sale,
  price_rent_monthly,
  property_type,
  originalPrice,
  address = "123 Palm Avenue, Beverly Hills, CA 90210",
  buildingName,
  nearestStation,
  transportInfo,
  building_name,
  nearest_station,
  transport_info,
  tag = "FOR SALE",
  transport,
  floorPlan: floorPlanProp,
  floor_plan,
  areaSize: areaSizeProp,
  floor_area,
  expectedRent,
  yearBuilt: yearBuiltProp,
  year_built,
  features,
  variant = "vertical",
  selected = false,
  onCardClick,
  detailPageId,
  itemId,
  selectable,
  selectedForInquiry,
  onToggleSelect,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();
  const [imgError, setImgError] = useState(false);

  // Effective values: tolerate server field names (snake_case / numeric) and a
  // media array. images[0] is the main image shown on the card.
  // The card thumbnail must be an image, never a video. A media entry (or a
  // directly-bound feature_image) may point at a video (.mp4 etc.); pick the
  // first non-video media URL and drop a video-valued candidate.
  const isVideoUrl = (u?: string) =>
    /\.(?:mp4|mov|m4v|webm|avi|mkv|ogv|flv|wmv)(?:[?#].*)?$/i.test(String(u || ""));
  const firstMediaUrl = (() => {
    if (!Array.isArray(images)) return "";
    for (const entry of images) {
      const url =
        typeof entry === "string"
          ? entry
          : entry?.url || entry?.storage_url || entry?.thumbnail_url || "";
      if (url && !isVideoUrl(url)) return url;
    }
    return "";
  })();
  // No unsplash placeholder: when there is no real image, show the "No Image" fallback.
  const candidate = imageProp || feature_image || firstMediaUrl || "";
  const image = isVideoUrl(candidate) ? "" : candidate;
  const showImageFallback = imgError || !image;

  // When the primary media is a video (with a poster), the card shows the poster
  // image plus a ▶ badge; clicking the card opens the detail page (real playback
  // happens in PropertySlider / PropertyDetail, not inside the grid card).
  const primaryMedia =
    Array.isArray(images) && images.length > 0 && typeof images[0] !== "string"
      ? (images[0] as PropertyMediaItem)
      : null;
  const primaryIsVideo =
    !!primaryMedia &&
    (primaryMedia.is_video === true ||
      String(primaryMedia.media_type || "").toLowerCase().includes("video")) &&
    !!(primaryMedia.poster ||
      (primaryMedia.thumbnail_url && !isVideoUrl(primaryMedia.thumbnail_url)));
  const videoBadge =
    primaryIsVideo && !showImageFallback ? (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    ) : null;

  // Inquiry-selection checkbox (top-right). stopPropagation so it doesn't trigger
  // card navigation.
  const selectCheckbox = selectable ? (
    <div
      className="absolute top-3 right-3 z-20"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        aria-label={t("Select for inquiry")}
        checked={!!selectedForInquiry}
        onChange={(e) => {
          e.stopPropagation();
          onToggleSelect?.();
        }}
        className="h-5 w-5 cursor-pointer rounded border-gray-300 bg-white/90 text-blue-600 shadow focus:ring-blue-500"
      />
    </div>
  ) : null;

  // Format a JPY amount: keep already-formatted strings (contain ¥ / 円 / 万);
  // otherwise prepend ¥ and add thousands separators.
  const formatJpy = (v?: string | number): string => {
    if (v === undefined || v === null || v === "") return "";
    const s = String(v).trim();
    if (/[¥￥円万]/.test(s)) return s;
    const num = Number(s.replace(/[,\s]/g, ""));
    if (!Number.isFinite(num) || num === 0) return "";
    return `¥${num.toLocaleString("ja-JP")}`;
  };
  const isRent = String(property_type || "").toLowerCase() === "rent";
  const saleFmt = formatJpy(priceProp || price_jpy || price_sale);
  const rentFmt = formatJpy(price_rent_monthly);
  const price = isRent
    ? rentFmt
      ? `${rentFmt} / 月`
      : saleFmt || t("お問い合わせ")
    : saleFmt || (rentFmt ? `${rentFmt} / 月` : "") || t("お問い合わせ");

  // Station line: prefer the value that includes the walk time (徒歩◯分); take
  // the first line only (transport_info can be multi-line).
  const stationText = (() => {
    const candidates = [nearestStation, nearest_station, transportInfo, transport_info]
      .map((s) => (s ? String(s).trim() : ""))
      .filter(Boolean);
    if (candidates.length === 0) return "";
    const withWalk = candidates.find((s) => /徒歩|分|walk|min/i.test(s));
    return (withWalk || candidates[0]).split(/\r?\n/)[0].trim();
  })();

  const floorPlan = floorPlanProp || floor_plan;
  const areaSize =
    areaSizeProp || (floor_area ? `${floor_area}㎡` : "");
  const yearBuilt =
    yearBuiltProp || (year_built ? `${year_built}年` : "");

  const mergedStyle: React.CSSProperties = {
    backgroundColor,
    fontSize,
    ...style,
  };

  const featureItems = normalizeFeatureList(features);

  const handleClick = () => {
    if (onCardClick) {
      onCardClick();
    } else if (__stackpage) {
      const selectedId = id || itemId || address;
      const item = { id: selectedId, price, address, tag };
      setPageState(__stackpage, ESTATE_STATE_KEYS.selectedPropertyId, item.id);
      __stackpage.emit(ESTATE_EVENTS.propertySelected, buildPropertySelectionEvent(item));
    }
    if (detailPageId) {
      const selectedId = id || itemId || address;
      window.location.href = `/view/${detailPageId}?item=${encodeURIComponent(selectedId)}`;
    }
  };

  // ── Tag color ──────────────────────────────────────────────────
  const tagColor = tag === "賃貸" || tag?.toLowerCase().includes("rent")
    ? "bg-emerald-600"
    : tag === "売買" || tag?.toLowerCase().includes("sale")
    ? "bg-blue-600"
    : "bg-violet-600";

  // ── Price display ──────────────────────────────────────────────
  const priceDisplay = (
    <div>
      {originalPrice && (
        <div className="text-sm text-gray-400 line-through mb-0.5">{originalPrice}</div>
      )}
      <div className="text-xl font-bold text-gray-900 tracking-tight">
        {price}
        {expectedRent && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            {t("想定賃料")}: {expectedRent}
          </span>
        )}
      </div>
    </div>
  );

  // ── Info rows ──────────────────────────────────────────────────
  const hasTransport = transport && transport.trim().length > 0;
  const hasPropertyInfo = floorPlan || areaSize || yearBuilt;
  const hasStationInfo = !!stationText;

  const transportRow = hasTransport && (
    <div className="flex items-start gap-1.5 text-sm text-gray-500">
      <TrainIcon />
      <span className="line-clamp-1">{transport}</span>
    </div>
  );

  const stationRow = hasStationInfo && (
    <div className="flex items-start gap-1.5 text-sm text-gray-500">
      <TrainIcon />
      <span className="line-clamp-1">{stationText}</span>
    </div>
  );

  const propertyInfoRow = hasPropertyInfo && (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
      {floorPlan && <span className="font-medium text-gray-700">{floorPlan}</span>}
      {areaSize && (
        <>
          {floorPlan && <span className="text-gray-300">|</span>}
          <span>{areaSize}</span>
        </>
      )}
      {yearBuilt && (
        <>
          <span className="text-gray-300">|</span>
          <CalendarIcon />
          <span>{yearBuilt}</span>
        </>
      )}
    </div>
  );

  // ── Detail link ─────────────────────────────────────────────────
  const detailLink = detailPageId && (
    <div className="pt-3 border-t border-gray-100 mt-auto">
      <span className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
        {t("詳細を見る")} →
      </span>
    </div>
  );

  // ── Build content ───────────────────────────────────────────────
  const cardContent = (
    <>
      {priceDisplay}
      <div className="flex items-start gap-1.5 text-sm text-gray-500">
        <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="line-clamp-1">{address}</span>
      </div>
      {buildingName && (
        <div className="text-sm font-medium text-gray-700 line-clamp-1">
          {buildingName}
        </div>
      )}
      {building_name && !buildingName && (
        <div className="text-sm font-medium text-gray-700 line-clamp-1">
          {building_name}
        </div>
      )}
      {stationRow}
      {transportRow}
      {propertyInfoRow}
      {featureItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {featureItems.slice(0, 4).map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"
            >
              {feature}
            </span>
          ))}
        </div>
      )}
      {detailLink}
    </>
  );

  const selectedRing = selected ? "ring-2 ring-blue-400 ring-offset-2" : "";

  // ── Horizontal variant ──────────────────────────────────────────
  if (variant === "horizontal") {
    return (
      <div
        className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col sm:flex-row h-full sm:h-44 ${selectedRing} ${className}`}
        style={mergedStyle}
        onClick={handleClick}
      >
        <div className="relative w-full sm:w-[180px] h-48 sm:h-full shrink-0 overflow-hidden">
          {showImageFallback ? (
            <PropertyImageFallback className="w-full h-full" />
          ) : (
            <img
              src={image}
              alt={address}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          )}
          {videoBadge}
          {selectCheckbox}
          <div className="absolute top-3 left-3">
            <span className={`${tagColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm uppercase tracking-wide`}>
              {t(tag)}
            </span>
          </div>
        </div>
        <div className="p-4 flex flex-col justify-center flex-1 min-w-0 space-y-1.5">
          {cardContent}
        </div>
      </div>
    );
  }

  // ── Vertical variant ────────────────────────────────────────────
  return (
    <div
      className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col h-full ${selectedRing} ${className}`}
      style={mergedStyle}
      onClick={handleClick}
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {showImageFallback ? (
          <PropertyImageFallback className="w-full h-full" />
        ) : (
          <img
            src={image}
            alt={address}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {videoBadge}
        {selectCheckbox}
        {/* Tag badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`${tagColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm uppercase tracking-wide inline-block`}>
            {t(tag)}
          </span>
        </div>
        {/* Price overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 pt-8">
          {originalPrice && (
            <div className="text-xs text-gray-300 line-through mb-0.5">{originalPrice}</div>
          )}
          <div className="text-xl font-bold text-white">{price}</div>
        </div>
        {selected && !selectable && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              {t("Selected")}
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="p-4 flex flex-col flex-1 space-y-2">
        {/* Building name (bold) */}
        {(buildingName || building_name) && (
          <div className="text-base font-bold text-gray-900 line-clamp-1">
            {buildingName || building_name}
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-1.5 text-sm text-gray-500">
          <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{address}</span>
        </div>

        {/* Property info (floorPlan / area / year) */}
        {propertyInfoRow}

        {/* Station / transport info */}
        {stationRow}
        {transportRow}

        {/* Expected rent */}
        {expectedRent && !floorPlan && !areaSize && (
          <div className="text-sm text-gray-500">
            <span className="text-gray-400">{t("想定賃料")}:</span>{" "}
            <span className="font-medium text-gray-700">{expectedRent}</span>
          </div>
        )}

        {/* Detail link */}
        {detailLink}
      </div>
    </div>
  );
};

export default PropertyCard;
