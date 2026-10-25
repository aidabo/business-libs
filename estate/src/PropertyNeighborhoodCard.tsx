import { useState } from "react";
import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useEstatePropertyModel, useInfoCardRows } from "./PropertyInfoCardBase";

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

/** One collapsed-by-default section. The neighborhood card can carry ~6 groups of
 *  ~5 entries each; rendered open they make the card far taller than the rest of the
 *  detail page, so each group starts folded and shows only its title + item count. */
function CollapsibleGroup({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition hover:bg-gray-50"
      >
        <span className="min-w-0 truncate text-xs font-semibold text-gray-600">
          {title} <span className="text-gray-400">({count})</span>
        </span>
        <ChevronIcon open={open} />
      </button>
      {open ? <div className="border-t border-gray-100 p-2">{children}</div> : null}
    </div>
  );
}

function splitItems(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "")
    .split(/\r?\n|、|,|，|\/|／/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function googleSearchUrl(term: string, address?: string): string {
  const query = [term, address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function parseJson(value: unknown): any | null {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return null;
  }
}

function formatDistance(distanceMeters: any, walkingMinutes: any): string {
  const minutes = Number(walkingMinutes);
  if (Number.isFinite(minutes) && minutes > 0) return `徒歩${Math.max(1, Math.round(minutes))}分`;
  const d = Number(distanceMeters);
  if (!Number.isFinite(d)) return "";
  if (d < 1000) return `${Math.round(d)}m`;
  return `${(d / 1000).toFixed(d < 10000 ? 1 : 0)}km`;
}

function NearbyGroup({ label, value, address }: { label: string; value: unknown; address?: string }) {
  const t = useT();
  const items = splitItems(value);
  if (items.length === 0) return null;
  return (
    <CollapsibleGroup title={t(label)} count={items.length}>
      <div className="flex min-w-0 flex-wrap gap-2">
        {items.map((item) => (
          <a
            key={`${label}-${item}`}
            href={googleSearchUrl(item, address)}
            target="_blank"
            rel="noreferrer"
            className="max-w-full break-words rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-100"
            title={t(`${item} をGoogle Mapsで検索`)}
          >
            {item}
          </a>
        ))}
      </div>
    </CollapsibleGroup>
  );
}

function PlaceResults({ data }: { data: any }) {
  const t = useT();
  const groups = [
    { key: "school", title: "Schools" },
    { key: "park", title: "Parks" },
    { key: "supermarket", title: "Supermarkets" },
    { key: "parking", title: "Parking" },
    { key: "shopping_street", title: "Shopping streets" },
    { key: "transport", title: "Transport access" },
  ];
  const hasAny = groups.some((group) => {
    if (group.key === "transport") {
      return (Array.isArray(data?.transport?.train?.items) && data.transport.train.items.length > 0)
        || (Array.isArray(data?.transport?.bus?.items) && data.transport.bus.items.length > 0);
    }
    return Array.isArray(data?.[group.key]?.items) && data[group.key].items.length > 0;
  });
  if (!hasAny) return null;

  return (
    <div className="min-w-0 space-y-3 rounded-xl border border-gray-200 bg-white p-3">
      <div className="text-[11px] font-semibold text-gray-500">{t("Google Places results")}</div>
      {groups.map((group) => {
        const items = group.key === "transport"
          ? [
              ...((Array.isArray(data?.transport?.train?.items) ? data.transport.train.items : [])).map((item: any) => ({ ...item, category: "電車" })),
              ...((Array.isArray(data?.transport?.bus?.items) ? data.transport.bus.items : [])).map((item: any) => ({ ...item, category: "バス" })),
            ]
          : Array.isArray(data?.[group.key]?.items) ? data[group.key].items : [];
        if (!items.length) return null;
        return (
          <CollapsibleGroup key={group.key} title={group.title} count={items.length}>
            <div className="space-y-1.5">
              {items.map((item: any, index: number) => {
                const name = String(item?.name || item?.address || `item-${index + 1}`).trim();
                const address = String(item?.address || "").trim();
                const typeLabel = String(item?.category || item?.primaryTypeLabel || item?.primaryType || "").trim();
                const distanceLabel = formatDistance(item?.distanceMeters, item?.walkingMinutes);
                const mapsUrl = String(
                  item?.googleMapsUrl ||
                  item?.googleMapsUri ||
                  item?.google_maps_url ||
                  item?.google_maps_uri ||
                  item?.mapsUrl ||
                  item?.mapsUri ||
                  item?.url ||
                  ""
                ).trim();
                return (
                  <div key={`${group.key}-${index}-${item?.placeId || name || index}`} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0 flex-1">
                        {mapsUrl ? (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="break-words text-sm font-semibold leading-5 text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {name}
                          </a>
                        ) : (
                          <div className="break-words text-sm font-semibold leading-5 text-gray-900">{name}</div>
                        )}
                        {address ? <div className="break-words text-xs leading-5 text-gray-500">{address}</div> : null}
                        <div className="text-xs leading-5 text-gray-500">{[typeLabel, distanceLabel].filter(Boolean).join(" ・ ") || " "}</div>
                      </div>
                        {mapsUrl ? (
                          <a href={mapsUrl} target="_blank" rel="noreferrer" className="shrink-0 self-start text-xs font-semibold text-blue-600 hover:text-blue-800">
                          {t("Open")}
                          </a>
                        ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleGroup>
        );
      })}
    </div>
  );
}

export default function PropertyNeighborhoodCard(props: PropertyInfoCardProps) {
  const t = useT();
  const model = useEstatePropertyModel(props);
  const fallbackRows = useInfoCardRows(props, "neighborhood");
  const googlePlacesData = parseJson(model.raw?.google_places_data || model.raw?.googlePlacesData);
  const showStructured = Boolean(googlePlacesData || model.nearbyStores || model.nearbyHospitals || model.nearbySchools || model.nearbyParks);
  if (!showStructured) {
    return <PropertyInfoCardShell eyebrow={t("Nearby")} title={props.title || t("Neighborhood")} description={props.description || t("Lifestyle facilities, schools, parks, and map links.")} rows={fallbackRows} accent="blue" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn} />;
  }
  const showHeader = props.headerVisible ?? props.showHeader ?? true;
  const compact = props.compact || props.density === "compact";
  const padding = props.contentPadding ?? (compact ? 12 : 20);
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {showHeader && (
        <div className="border-b border-blue-200 bg-blue-50 px-5 py-4 text-blue-700">
          <div className="text-xs font-semibold uppercase tracking-[0.2em]">{t("Nearby")}</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-950">{props.title || t("Neighborhood")}</h4>
          <p className="mt-1 text-sm text-slate-600">{props.description || t("Check schools, hospitals, supermarkets, and more in Google Maps.")}</p>
        </div>
      )}
      <div className="min-w-0 space-y-3" style={{ padding }}>
        {model.neighborhoodSummary ? <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{model.neighborhoodSummary}</p> : null}
        <PlaceResults data={googlePlacesData} />
        {!googlePlacesData ? (
          <>
            <NearbyGroup label="Nearby stores and commercial facilities" value={model.nearbyStores} address={model.address} />
            <NearbyGroup label="Medical facilities" value={model.nearbyHospitals} address={model.address} />
            <NearbyGroup label="Schools and educational facilities" value={model.nearbySchools} address={model.address} />
            <NearbyGroup label="Parks and green spaces" value={model.nearbyParks} address={model.address} />
          </>
        ) : null}
        {model.googleMapUrl ? (
          <a href={model.googleMapUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
            {t("Open Google Maps")}
          </a>
        ) : null}
      </div>
    </section>
  );
}
