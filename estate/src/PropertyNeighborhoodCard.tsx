import { ESTATE_STATE_KEYS, getPageState } from "./types";
import { PropertyInfoCardProps, PropertyInfoCardShell, resolveInfoCardRows } from "./PropertyInfoCardBase";
import { resolveEstateProperty } from "./utils/propertyDisplay";

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

function resolveModel(props: PropertyInfoCardProps) {
  const selectedPropertyId = props.selectedPropertyId || String(getPageState(props.__stackpage, props.selectedPropertyIdKey || ESTATE_STATE_KEYS.selectedPropertyId, ""));
  return resolveEstateProperty({ ...props, selectedPropertyId });
}

function NearbyGroup({ label, value, address }: { label: string; value: unknown; address?: string }) {
  const items = splitItems(value);
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-500">{label}</div>
      <div className="mt-2 flex min-w-0 flex-wrap gap-2">
        {items.map((item) => (
          <a
            key={`${label}-${item}`}
            href={googleSearchUrl(item, address)}
            target="_blank"
            rel="noreferrer"
            className="max-w-full break-words rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-100"
            title={`${item} をGoogle Mapsで検索`}
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

function PlaceResults({ data }: { data: any }) {
  const groups = [
    { key: "school", title: "学校候補" },
    { key: "park", title: "公園" },
    { key: "supermarket", title: "スーパー" },
    { key: "parking", title: "駐車場" },
    { key: "shopping_street", title: "商店街候補" },
    { key: "transport", title: "交通アクセス候補" },
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
      <div className="text-[11px] font-semibold text-gray-500">Google Places results</div>
      {groups.map((group) => {
        const items = group.key === "transport"
          ? [
              ...((Array.isArray(data?.transport?.train?.items) ? data.transport.train.items : [])).map((item: any) => ({ ...item, category: "電車" })),
              ...((Array.isArray(data?.transport?.bus?.items) ? data.transport.bus.items : [])).map((item: any) => ({ ...item, category: "バス" })),
            ]
          : Array.isArray(data?.[group.key]?.items) ? data[group.key].items : [];
        if (!items.length) return null;
        return (
          <div key={group.key} className="space-y-1.5">
            <div className="text-xs font-semibold text-gray-500">{group.title} ({items.length})</div>
            <div className="space-y-1.5">
              {items.slice(0, 5).map((item: any, index: number) => {
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
                        <div className="break-words text-sm font-semibold leading-5 text-gray-900">{name}</div>
                        {address ? <div className="break-words text-xs leading-5 text-gray-500">{address}</div> : null}
                        <div className="text-xs leading-5 text-gray-500">{[typeLabel, distanceLabel].filter(Boolean).join(" ・ ") || " "}</div>
                      </div>
                      {mapsUrl ? (
                        <a href={mapsUrl} target="_blank" rel="noreferrer" className="shrink-0 self-start text-xs font-semibold text-blue-600 hover:text-blue-800">
                          開く
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PropertyNeighborhoodCard(props: PropertyInfoCardProps) {
  const model = resolveModel(props);
  const googlePlacesData = parseJson(model.raw?.google_places_data || model.raw?.googlePlacesData);
  const showStructured = Boolean(googlePlacesData || model.nearbyStores || model.nearbyHospitals || model.nearbySchools || model.nearbyParks);
  if (!showStructured) {
    return <PropertyInfoCardShell eyebrow="Nearby" title={props.title || "周辺情報"} description={props.description || "生活施設、教育施設、公園、地図リンクを表示します。"} rows={resolveInfoCardRows(props, "neighborhood")} accent="blue" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn} />;
  }
  const showHeader = props.headerVisible ?? props.showHeader ?? true;
  const compact = props.compact || props.density === "compact";
  const padding = props.contentPadding ?? (compact ? 12 : 20);
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {showHeader && (
        <div className="border-b border-blue-200 bg-blue-50 px-5 py-4 text-blue-700">
          <div className="text-xs font-semibold uppercase tracking-[0.2em]">Nearby</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-950">{props.title || "周辺情報"}</h4>
          <p className="mt-1 text-sm text-slate-600">{props.description || "学校、病院、スーパーなどをGoogle Mapsで確認できます。"}</p>
        </div>
      )}
      <div className="min-w-0 space-y-3" style={{ padding }}>
        {model.neighborhoodSummary ? <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{model.neighborhoodSummary}</p> : null}
        <PlaceResults data={googlePlacesData} />
        {!googlePlacesData ? (
          <>
            <NearbyGroup label="スーパー・商業施設" value={model.nearbyStores} address={model.address} />
            <NearbyGroup label="病院・医療機関" value={model.nearbyHospitals} address={model.address} />
            <NearbyGroup label="学校・教育施設" value={model.nearbySchools} address={model.address} />
            <NearbyGroup label="公園・緑地" value={model.nearbyParks} address={model.address} />
          </>
        ) : null}
        {model.googleMapUrl ? (
          <a href={model.googleMapUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
            Google Mapを開く
          </a>
        ) : null}
      </div>
    </section>
  );
}
