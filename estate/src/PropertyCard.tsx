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
  <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-300">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  </div>
);

// ── Props ──────────────────────────────────────────────────────────

export interface PropertyCardProps {
  id?: string;
  image?: string;
  price?: string;
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
  image = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  price = "$850,000",
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
  floorPlan,
  areaSize,
  expectedRent,
  yearBuilt,
  features,
  variant = "vertical",
  selected = false,
  onCardClick,
  detailPageId,
  itemId,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}) => {
  const t = useT();
  const [imgError, setImgError] = useState(false);

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
  const hasStationInfo = nearestStation || transportInfo || nearest_station || transport_info;

  const transportRow = hasTransport && (
    <div className="flex items-start gap-1.5 text-xs text-gray-500">
      <TrainIcon />
      <span className="line-clamp-1">{transport}</span>
    </div>
  );

  const stationRow = hasStationInfo && (
    <div className="flex items-start gap-1.5 text-xs text-gray-500">
      <TrainIcon />
        <span className="line-clamp-1">
          {nearestStation || transportInfo || nearest_station || transport_info}
        </span>
      </div>
  );

  const propertyInfoRow = hasPropertyInfo && (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
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
      <span className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
        {t("詳細を見る")} →
      </span>
    </div>
  );

  // ── Build content ───────────────────────────────────────────────
  const cardContent = (
    <>
      {priceDisplay}
      <div className="flex items-start gap-1.5 text-xs text-gray-500">
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
          {imgError ? (
            <PropertyImageFallback className="w-full h-full" />
          ) : (
            <img
              src={image}
              alt={address}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          )}
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
        {imgError ? (
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
          <div className="text-lg font-bold text-white">{price}</div>
        </div>
        {selected && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              {t("Selected")}
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="p-4 flex flex-col flex-1 space-y-2">
        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-gray-500">
          <MapPinIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{address}</span>
        </div>

        {/* Transport */}
        {transportRow}

        {/* Property info (floorPlan / area / year) */}
        {propertyInfoRow}

        {/* Expected rent */}
        {expectedRent && !floorPlan && !areaSize && (
          <div className="text-xs text-gray-500">
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
