import React from "react";
import { useT } from "./hooks/useTranslation";
import { buildGoogleMapsStreetViewUrl } from "./utils/urlBuilders";

export interface StreetViewCardProps {
  title?: string;
  subtitle?: string;
  viewpoint?: string;
  heading?: number;
  pitch?: number;
  fov?: number;
  /** Address fallback — used when viewpoint coordinates are not available */
  address?: string;
  locationLabel?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Build a Google Maps embed URL that shows the street view location on a map */
function buildEmbedUrl(viewpoint: string): string {
  const [lat, lng] = viewpoint.split(",").map(Number);
  if (!isFinite(lat) || !isFinite(lng)) return "";
  // Use Google Maps search/place embed — works with coordinates
  const q = encodeURIComponent(`${lat},${lng}`);
  return `https://maps.google.com/maps?q=${q}&z=17&output=embed`;
}

/** Build a Google Maps embed URL using address string (no API key needed) */
function buildAddressEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=17&output=embed`;
}

export default function StreetViewCard({
  title = "Neighborhood Street View",
  subtitle = "Preview the surroundings for the selected property before a viewing.",
  viewpoint = "35.6595,139.7005",
  heading = 175,
  pitch = 8,
  fov = 75,
  address,
  locationLabel = "Shibuya, Tokyo",
  backgroundColor,
  fontSize,
  className = "",
  style,
}: StreetViewCardProps) {
  const t = useT();

  // Determine source: prefer viewpoint coords, fall back to address
  const hasViewpoint = viewpoint && viewpoint.includes(",") && isFinite(Number(viewpoint.split(",")[0]));
  const hasAddress = !!address;

  const streetViewUrl = hasViewpoint
    ? buildGoogleMapsStreetViewUrl({ viewpoint, heading, pitch, fov })
    : hasAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(address)}`
    : "";
  const embedUrl = hasViewpoint ? buildEmbedUrl(viewpoint) : hasAddress ? buildAddressEmbedUrl(address) : "";

  // Show nothing if no location data at all
  if (!hasViewpoint && !hasAddress) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm ${className}`}
      style={{ backgroundColor, fontSize, ...style }}
    >
      <div className="bg-gradient-to-r from-emerald-50 via-white to-cyan-50 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              {t("Location lane")}
            </div>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{t(title)}</h3>
            <p className="mt-1 text-sm text-slate-600">{t(subtitle)}</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {t("street view")}
          </span>
        </div>
      </div>

      {/* Embedded location map with viewer controls */}
      {embedUrl && (
        <div className="relative h-[200px] w-full overflow-hidden lg:h-[240px]">
          <iframe
            title={t("Street view location")}
            src={embedUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {/* Location indicator overlay */}
          <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            {hasViewpoint ? viewpoint : address}
          </div>
          {/* Camera direction overlay (coordinates only) */}
          {hasViewpoint && (
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
                {heading}°
              </span>
              <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
                {t("fov")} {fov}
              </span>
            </div>
          )}
          {/* Street View CTA overlay */}
          <a
            href={streetViewUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-3 rounded-lg bg-emerald-600/90 px-3.5 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-emerald-700"
          >
            {t("Open Street View")}
          </a>
        </div>
      )}

      {/* Heading compass + location info */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          {/* Simple compass indicator (coordinates only) */}
          {hasViewpoint ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700">
              <span
                className="inline-block transition-transform"
                style={{ transform: `rotate(${heading}deg)` }}
              >
                ↑
              </span>
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
          )}
          <span className="text-sm font-medium text-slate-800">{t(locationLabel)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            {t("Free")}
          </span>
          <span className="text-slate-300">|</span>
          <span>{t("Street View")}</span>
        </div>
      </div>
    </div>
  );
}
