import { useT } from "./hooks/useTranslation";
import { PropertyInfoCardProps, PropertyInfoCardShell, useEstatePropertyModel, useInfoCardRows } from "./PropertyInfoCardBase";

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

function text(value: unknown): string {
  return String(value || "").trim();
}

function splitLocalizedHazard(value: string, index: number, fallbackLabel: string) {
  const separator = value.indexOf(":");
  return {
    key: `localized-${index}`,
    label: separator >= 0 ? value.slice(0, separator).trim() : fallbackLabel,
    value: separator >= 0 ? value.slice(separator + 1).trim() : value,
  };
}

export default function PropertyHazardCard(props: PropertyInfoCardProps) {
  const t = useT();
  const model = useEstatePropertyModel(props);
  const fallbackRows = useInfoCardRows(props, "hazard");
  const raw = model.raw || {};
  const rows = HAZARD_FIELDS
    .map(([key, label]) => ({ key, label, value: text(raw[key]) }))
    .filter((row) => row.value);
  const localizedRows = props.localeViewModel?.hazardItems
    .map((item, index) => splitLocalizedHazard(item.text, index, t("Hazard")))
    .filter((row) => row.value) || [];
  const displayRows = localizedRows.length > 0 ? localizedRows : rows;
  const hasStructured = Boolean(model.hazardMapUrl || model.hazardSummary || displayRows.length > 0 || model.floodRisk || model.landslideRisk || model.tsunamiRisk);
  if (!hasStructured) {
    return <PropertyInfoCardShell eyebrow={t("Hazard")} title={props.title || t("Disaster and hazard information")} description={props.description || t("Review flood, landslide, and tsunami risks.")} rows={fallbackRows} accent="orange" showHeader={props.headerVisible ?? props.showHeader ?? true} density={props.density} compact={props.compact} contentPadding={props.contentPadding} rowPaddingY={props.rowPaddingY} rowGap={props.rowGap} linkDisplay={props.linkDisplay} mobileTwoColumn={props.mobileTwoColumn} />;
  }
  const showHeader = props.headerVisible ?? props.showHeader ?? true;
  const compact = props.compact || props.density === "compact";
  const padding = props.contentPadding ?? (compact ? 12 : 20);
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {showHeader && (
        <div className="border-b border-orange-200 bg-orange-50 px-5 py-4 text-orange-700">
          <div className="text-xs font-semibold uppercase tracking-[0.2em]">{t("Hazard")}</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-950">{props.title || t("Disaster and hazard information")}</h4>
          <p className="mt-1 text-sm text-slate-600">{props.description || t("The same hazard highlights as the property editor.")}</p>
        </div>
      )}
      <div className="min-w-0 space-y-3" style={{ padding }}>
        <div className="flex min-w-0 flex-wrap gap-2">
          {model.hazardMapUrl ? (
            <a href={model.hazardMapUrl} target="_blank" rel="noreferrer" className="max-w-full break-words rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700">
              {t("Open hazard map")}
            </a>
          ) : null}
          {model.floodRisk ? <span className="max-w-full break-words rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">{t("Flood")}: {model.floodRisk}</span> : null}
          {model.landslideRisk ? <span className="max-w-full break-words rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">{t("Landslide")}: {model.landslideRisk}</span> : null}
          {model.tsunamiRisk ? <span className="max-w-full break-words rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">{t("Tsunami")}: {model.tsunamiRisk}</span> : null}
        </div>
        {model.hazardSummary ? <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{model.hazardSummary}</p> : null}
        {displayRows.length > 0 ? (
          <dl className="grid min-w-0 gap-2 md:grid-cols-2">
            {displayRows.map((row) => (
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
