import { ESTATE_STATE_KEYS, getPageState } from "./types";
import { PropertyInfoCardProps, PropertyInfoCardShell, resolveInfoCardRows } from "./PropertyInfoCardBase";
import { resolveEstateProperty } from "./utils/propertyDisplay";

const HAZARD_FIELDS = [
  ["flood_inundation_info", "洪水浸水"],
  ["storm_surge_info", "高潮"],
  ["tsunami_info", "津波"],
  ["landslide_warning_info", "土砂災害警戒"],
  ["disaster_hazard_area_info", "災害危険区域"],
  ["liquefaction_info", "液状化"],
  ["large_scale_fill_info", "大規模盛土"],
  ["landslide_prevention_info", "地すべり防止"],
  ["steep_slope_info", "急傾斜地"],
] as const;

function resolveModel(props: PropertyInfoCardProps) {
  const selectedPropertyId = props.selectedPropertyId || String(getPageState(props.__stackpage, props.selectedPropertyIdKey || ESTATE_STATE_KEYS.selectedPropertyId, ""));
  return resolveEstateProperty({ ...props, selectedPropertyId });
}

function text(value: unknown): string {
  return String(value || "").trim();
}

export default function PropertyHazardCard(props: PropertyInfoCardProps) {
  const model = resolveModel(props);
  const raw = model.raw || {};
  const rows = HAZARD_FIELDS
    .map(([key, label]) => ({ key, label, value: text(raw[key]) }))
    .filter((row) => row.value);
  const hasStructured = Boolean(model.hazardMapUrl || model.hazardSummary || rows.length > 0 || model.floodRisk || model.landslideRisk || model.tsunamiRisk);
  if (!hasStructured) {
    return <PropertyInfoCardShell eyebrow="Hazard" title={props.title || "災害・ハザード情報"} description={props.description || "洪水、土砂災害、津波などの確認用ブロックです。"} rows={resolveInfoCardRows(props, "hazard")} accent="orange" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn} />;
  }
  const showHeader = props.headerVisible ?? props.showHeader ?? true;
  const compact = props.compact || props.density === "compact";
  const padding = props.contentPadding ?? (compact ? 12 : 20);
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {showHeader && (
        <div className="border-b border-orange-200 bg-orange-50 px-5 py-4 text-orange-700">
          <div className="text-xs font-semibold uppercase tracking-[0.2em]">Hazard</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-950">{props.title || "災害・ハザード情報"}</h4>
          <p className="mt-1 text-sm text-slate-600">{props.description || "物件編集画面と同じハザード要点を表示します。"}</p>
        </div>
      )}
      <div className="min-w-0 space-y-3" style={{ padding }}>
        <div className="flex min-w-0 flex-wrap gap-2">
          {model.hazardMapUrl ? (
            <a href={model.hazardMapUrl} target="_blank" rel="noreferrer" className="max-w-full break-words rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700">
              ハザードマップを開く
            </a>
          ) : null}
          {model.floodRisk ? <span className="max-w-full break-words rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">洪水: {model.floodRisk}</span> : null}
          {model.landslideRisk ? <span className="max-w-full break-words rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">土砂: {model.landslideRisk}</span> : null}
          {model.tsunamiRisk ? <span className="max-w-full break-words rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">津波: {model.tsunamiRisk}</span> : null}
        </div>
        {model.hazardSummary ? <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{model.hazardSummary}</p> : null}
        {rows.length > 0 ? (
          <dl className="grid min-w-0 gap-2 md:grid-cols-2">
            {rows.map((row) => (
              <div key={row.key} className="min-w-0 rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-500">{row.label}</dt>
                <dd className="mt-1 break-words text-sm font-medium leading-6 text-slate-800">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
