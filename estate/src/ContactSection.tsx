import React from "react";
import { PhoneIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useT } from "./hooks/useTranslation";
import {
  buildGoogleMapsMarkerUrl,
  extractLatLngFromMapUrl,
} from "./utils/urlBuilders";

/** One labeled block in the info panel — e.g. 所在地 / 交通情報 / 営業時間.
 *  `text` may hold several lines separated by newlines; each becomes its own row. */
export interface ContactInfoItem {
  label?: string;
  text?: string;
}

export interface ContactSectionProps {
  /** Optional heading + lead paragraph above the two columns. */
  heading?: string;
  description?: string;
  /** Which side the map sits on. */
  mapPosition?: "left" | "right";

  // ── Map (embedded, no API key). Priority: URL → lat/lng → address. ──────────
  /** A Google Maps share/place/embed URL. Highest priority when set. */
  mapUrl?: string;
  /** Latitude (緯度). Used when no URL is set; ignored when it and longitude are BOTH 0. */
  latitude?: number | string;
  /** Longitude (経度). */
  longitude?: number | string;
  /** Address used to locate the map when no URL/coordinates are given. */
  mapAddress?: string;
  mapZoom?: number;
  mapHeight?: string;
  showMapLink?: boolean;
  mapLinkLabel?: string;

  // ── Info panel ──────────────────────────────────────────────────────────────
  /** Editable labeled blocks (address, train access, business hours, …). */
  infoItems?: ContactInfoItem[];

  // ── Phone call-to-action box ─────────────────────────────────────────────────
  showPhone?: boolean;
  phone?: string;
  phoneNote?: string;

  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

const clean = (v: unknown) => String(v ?? "").trim();
const toNum = (v: unknown) => (clean(v) === "" ? NaN : Number(v));
const isEmbedUrl = (url: string) => /output=embed|\/maps\/embed/i.test(clean(url));
const coordEmbed = (center: string, zoom: number) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(center)}&z=${zoom}&output=embed`;
const queryEmbed = (query: string, zoom: number) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;

const ContactSection: React.FC<ContactSectionProps> = ({
  heading = "",
  description = "",
  mapPosition = "left",
  mapUrl = "",
  latitude = 35.7205,
  longitude = 139.7523,
  mapAddress = "",
  mapZoom = 16,
  mapHeight = "420px",
  showMapLink = true,
  mapLinkLabel = "",
  infoItems = [],
  showPhone = true,
  phone = "",
  phoneNote = "",
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();

  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };

  // ── Resolve the map source (same rules as GoogleMapCard). ────────────────────
  const url = clean(mapUrl);
  const addr = clean(mapAddress);
  const z = Math.max(1, Math.min(21, Number(mapZoom) || 16));
  const lat = toNum(latitude);
  const lng = toNum(longitude);
  const latLng =
    isFinite(lat) && isFinite(lng) && !(lat === 0 && lng === 0) ? `${lat},${lng}` : "";

  let embedSrc = "";
  let openUrl = "";
  if (url) {
    const urlCoords = extractLatLngFromMapUrl(url);
    embedSrc = isEmbedUrl(url)
      ? url
      : urlCoords
        ? coordEmbed(urlCoords, z)
        : queryEmbed(url, z);
    openUrl = url;
  } else if (latLng) {
    embedSrc = coordEmbed(latLng, z);
    openUrl = buildGoogleMapsMarkerUrl(latLng);
  } else if (addr) {
    embedSrc = queryEmbed(addr, z);
    openUrl = buildGoogleMapsMarkerUrl(addr);
  }

  const items = (Array.isArray(infoItems) ? infoItems : []).filter(
    (item) => clean(item?.label) || clean(item?.text),
  );
  const phoneNumber = clean(phone);

  const mapColumn = embedSrc ? (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
      style={{ height: mapHeight }}
    >
      <iframe
        title={heading || t("Access map")}
        src={embedSrc}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {showMapLink && openUrl && (
        <a
          href={openUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200 backdrop-blur-sm transition hover:bg-white hover:shadow"
        >
          {clean(mapLinkLabel) || t("Open in Google Maps")}
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  ) : (
    <div
      className="flex w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-400"
      style={{ height: mapHeight }}
    >
      {t("Access map")}
    </div>
  );

  const infoColumn = (
    <div>
      {(clean(heading) || clean(description)) && (
        <div className="mb-6">
          {clean(heading) && (
            <h2 className="text-3xl font-bold text-gray-900">{heading}</h2>
          )}
          {clean(description) && (
            <p className="mt-3 text-lg text-gray-600">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-5">
        {items.map((item, index) => {
          const lines = clean(item?.text)
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
          return (
            <div key={`${item?.label || "item"}-${index}`} className="flex items-start gap-3">
              <CheckCircleIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
              <div>
                {clean(item?.label) && (
                  <h4 className="text-lg font-semibold text-gray-900">{item.label}</h4>
                )}
                {lines.map((line, lineIndex) => (
                  <p key={lineIndex} className="text-gray-600">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showPhone && phoneNumber && (
        <div className="mt-6 rounded-lg bg-blue-800 px-6 py-5 text-center text-white">
          <a
            href={`tel:${phoneNumber.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center justify-center gap-2 text-xl font-bold tracking-wide hover:underline"
          >
            <PhoneIcon className="h-5 w-5" />
            {phoneNumber}
          </a>
          {clean(phoneNote) && (
            <p className="mt-1 text-sm text-blue-100">{phoneNote}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white py-16 ${className}`} style={mergedStyle}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          {mapPosition === "right" ? (
            <>
              {infoColumn}
              {mapColumn}
            </>
          ) : (
            <>
              {mapColumn}
              {infoColumn}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
