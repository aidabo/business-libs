import React from "react";
import { useT } from "./hooks/useTranslation";
import { buildGoogleMapsMarkerUrl } from "./utils/urlBuilders";
import { useResolvedMapLocation } from "./PropertyInfoCardBase";
import type { StackPageRuntimeApi } from "./types";

export interface MapCardProps {
  title?: string;
  subtitle?: string;
  center?: string;
  zoom?: number;
  /** Address fallback — used when center coordinates are not available */
  address?: string;
  /** Precise "open in Google Maps" URL (with a marker) from the places search. */
  mapUrl?: string;
  locationLabel?: string;
  /** Bind to a property to auto-resolve its precise location (google_map_url). */
  items?: any[];
  selectedPropertyId?: string;
  selectedPropertyIdKey?: string;
  itemIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

function centerToBbox(center: string, zoom: number) {
  const [lat, lng] = center.split(",").map(Number);
  if (!isFinite(lat) || !isFinite(lng)) return "";
  // Each zoom level halves the viewport. At zoom 16 ~0.02° wide.
  const viewW = (0.02 / Math.pow(2, 16 - zoom)) || 0.02;
  const viewH = viewW * 0.75;
  return `${lng - viewW / 2},${lat - viewH / 2},${lng + viewW / 2},${lat + viewH / 2}`;
}

/** Build a Google Maps embed URL using address string (no API key needed) */
function buildAddressEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=17&output=embed`;
}

export default function MapCard(props: MapCardProps) {
  const {
    title = "Location Map",
    subtitle = "Check the neighborhood map before booking a showing.",
    zoom = 16,
    locationLabel = "Shibuya, Tokyo",
    backgroundColor,
    fontSize,
    className = "",
    style,
  } = props;
  const t = useT();

  // Resolve the precise location (bound property's google_map_url, or explicit props).
  const { center, address, mapUrl } = useResolvedMapLocation(props);

  // Determine embed source: prefer coordinates (OSM), fall back to address (Google Maps)
  const hasCenter = center && center.includes(",") && isFinite(Number(center.split(",")[0]));
  const hasAddress = !!address;

  // Open link: prefer the precise places URL (with a marker), else a marker search
  // on the coordinate/address (map_action=map only centers — no pin).
  const openUrl =
    (mapUrl && mapUrl.trim()) ||
    (hasCenter ? buildGoogleMapsMarkerUrl(center) : hasAddress ? buildGoogleMapsMarkerUrl(address) : "");
  const bbox = hasCenter ? centerToBbox(center, zoom) : "";
  const osmEmbedUrl = bbox
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center}`
    : "";
  const addressEmbedUrl = hasAddress ? buildAddressEmbedUrl(address) : "";

  // Show nothing if no location data at all
  if (!hasCenter && !hasAddress) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm ${className}`}
      style={{ backgroundColor, fontSize, ...style }}
    >
      <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50/80 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              {t("Location overview")}
            </div>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{t(title)}</h3>
            <p className="mt-1 text-sm text-slate-600">{t(subtitle)}</p>
          </div>
          <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            {t("map")}
          </span>
        </div>
      </div>

      {/* Embedded map — OSM if coordinates, Google Maps if address only */}
      {(osmEmbedUrl || addressEmbedUrl) && (
        <div className="relative h-[200px] w-full overflow-hidden lg:h-[240px]">
          <iframe
            title={t(locationLabel)}
            src={osmEmbedUrl || addressEmbedUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {/* Open in Google Maps overlay — subtle, always visible */}
          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200 backdrop-blur-sm transition hover:bg-white hover:shadow"
          >
            Google Maps で開く
          </a>
        </div>
      )}

      {/* Info footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {hasCenter ? (
            <>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {t("center")} {center}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {t("zoom")} {zoom}
              </span>
            </>
          ) : (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {address}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">{t(locationLabel)}</span>
      </div>
    </div>
  );
}
