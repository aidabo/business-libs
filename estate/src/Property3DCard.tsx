import React from "react";
import { useT } from "./hooks/useTranslation";
import {
  buildGoogleMaps3DUrl,
  buildGoogleSatelliteEmbedUrl,
  buildGoogleMapsSatelliteMarkerUrl,
} from "./utils/urlBuilders";
import { useResolvedMapLocation } from "./PropertyInfoCardBase";
import type { StackPageRuntimeApi } from "./types";

export interface Property3DCardProps {
  title?: string;
  subtitle?: string;
  /** "lat,lng" — preferred source for the aerial/3D view. */
  center?: string;
  zoom?: number;
  /** Address fallback — used when center coordinates are not available. */
  address?: string;
  /** Precise 3D "open" URL (place marker) from the places search. */
  google3dUrl?: string;
  locationLabel?: string;
  /** Bind to a property to auto-resolve its precise location (google_3d_url). */
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

/** Build a Google Maps satellite embed from an address (no coords, no API key). */
function buildAddressSatelliteEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=k&z=18&output=embed`;
}

const Property3DCard: React.FC<Property3DCardProps> = (props) => {
  const {
    title = "3D View",
    subtitle = "航空写真で周辺のボリューム感を確認できます。",
    zoom = 18,
    locationLabel = "",
    backgroundColor,
    fontSize,
    className = "",
    style,
  } = props;
  const t = useT();

  // Resolve the precise location (bound property's google_3d_url, or explicit props).
  const { center, address, google3dUrl } = useResolvedMapLocation(props);

  const hasCenter =
    !!center && center.includes(",") && isFinite(Number(center.split(",")[0]));
  const hasAddress = !!address;

  const embedUrl = hasCenter
    ? buildGoogleSatelliteEmbedUrl({ center, zoom })
    : hasAddress
      ? buildAddressSatelliteEmbedUrl(address as string)
      : "";
  // Two complementary links — Google Maps can't show both at once:
  //  • "3Dを開く": the tilted Earth/3D view (dramatic, but Earth mode drops the pin).
  //  • "位置を確認": top-down satellite with a clear marker (shows where the building is).
  const openUrl =
    (google3dUrl && google3dUrl.trim()) ||
    (hasCenter
      ? buildGoogleMaps3DUrl({ center })
      : hasAddress
        ? `https://www.google.com/maps/search/${encodeURIComponent(address as string)}`
        : "");
  const locateUrl = hasCenter
    ? buildGoogleMapsSatelliteMarkerUrl({ center })
    : hasAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address as string)}&basemap=satellite`
      : "";

  if (!embedUrl) return null;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm ${className}`}
      style={{ backgroundColor, fontSize, ...style }}
    >
      <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-amber-50 via-white to-amber-50/80 px-5 py-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            {t("Aerial")}
          </div>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{t(title)}</h3>
          <p className="mt-1 text-sm text-slate-600">{t(subtitle)}</p>
        </div>
        {(openUrl || locateUrl) && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {locateUrl && (
              <a
                href={locateUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm ring-1 ring-amber-300 transition hover:bg-amber-50"
              >
                {t("Check location")}
              </a>
            )}
            {openUrl && (
              <a
                href={openUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
              >
                {t("Open 3D view")}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="relative h-[220px] w-full overflow-hidden lg:h-[260px]">
        <iframe
          title={t(locationLabel || title)}
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      {(locationLabel || address) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            {locationLabel || address}
          </span>
        </div>
      )}
    </div>
  );
};

export default Property3DCard;
