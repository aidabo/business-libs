import { ESTATE_STATE_KEYS, getPageState } from "./types";
import type { StackPageRuntimeApi } from "./types";
import { FieldRow, getEstateFieldGroups, resolveEstateProperty } from "./utils/propertyDisplay";

export type PropertyInfoCardDensity = "compact" | "normal" | "comfortable";
export type PropertyUrlDisplay = "label" | "chip" | "button";

export type PropertyInfoCardProps = Record<string, any> & {
  property?: any;
  items?: any[];
  selectedPropertyId?: string;
  selectedPropertyIdKey?: string;
  itemIdKey?: string;
  title?: string;
  description?: string;
  emptyText?: string;
  showHeader?: boolean;
  headerVisible?: boolean;
  density?: PropertyInfoCardDensity;
  compact?: boolean;
  contentPadding?: number | string;
  rowPaddingY?: number | string;
  rowGap?: number | string;
  linkDisplay?: PropertyUrlDisplay;
  mobileTwoColumn?: boolean;
  showPropertyId?: boolean;
  showPropertyType?: boolean;
  showStatus?: boolean;
  showSource?: boolean;
  showSourceCompany?: boolean;
  __stackpage?: StackPageRuntimeApi;
};

function filterBasicRows(rows: FieldRow[], props: PropertyInfoCardProps): FieldRow[] {
  const visibility: Record<string, boolean | undefined> = {
    id: props.showPropertyId,
    propertyType: props.showPropertyType,
    status: props.showStatus,
    source: props.showSource,
    sourceCompany: props.showSourceCompany,
  };
  return rows.filter((row) => visibility[row.key] !== false);
}

export function resolveInfoCardRows(props: PropertyInfoCardProps, group: keyof ReturnType<typeof getEstateFieldGroups>): FieldRow[] {
  const selectedPropertyId = props.selectedPropertyId || String(getPageState(props.__stackpage, props.selectedPropertyIdKey || ESTATE_STATE_KEYS.selectedPropertyId, ""));
  const model = resolveEstateProperty({ ...props, selectedPropertyId });
  const rows = getEstateFieldGroups(model)[group];
  return group === "basic" ? filterBasicRows(rows, props) : rows;
}

function spacingFor(density: PropertyInfoCardDensity | undefined, compact: boolean | undefined) {
  const resolved = compact ? "compact" : density || "normal";
  if (resolved === "compact") {
    return { contentPadding: 12, rowPaddingY: 8, rowGap: 0, chipPadding: "px-2.5 py-0.5 text-xs" };
  }
  if (resolved === "comfortable") {
    return { contentPadding: 24, rowPaddingY: 14, rowGap: 4, chipPadding: "px-3.5 py-1.5 text-sm" };
  }
  return { contentPadding: 20, rowPaddingY: 12, rowGap: 0, chipPadding: "px-3 py-1 text-sm" };
}

function toCssSize(value: number | string | undefined, fallback: number): string | number {
  return value ?? fallback;
}

function isUrlValue(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function LinkValue({ row, mode }: { row: FieldRow; mode: PropertyUrlDisplay }) {
  if (!row.href) return <>{row.value}</>;
  const text = isUrlValue(row.value) ? "開く" : row.value;
  if (mode === "button") {
    return (
      <a href={row.href} target="_blank" rel="noreferrer" className="inline-flex max-w-full break-words rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
        {text === "開く" ? `${row.label}を開く` : text}
      </a>
    );
  }
  if (mode === "chip") {
    return (
      <a href={row.href} target="_blank" rel="noreferrer" className="inline-flex max-w-full break-words rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
        {text === "開く" ? row.label : text}
      </a>
    );
  }
  return (
    <a href={row.href} target="_blank" rel="noreferrer" className="text-blue-700 underline underline-offset-2 hover:text-blue-900">
      {text}
    </a>
  );
}

export function PropertyInfoCardShell({
  eyebrow,
  title,
  description,
  rows,
  emptyText = "表示できる項目がありません。",
  accent = "blue",
  asChips = false,
  showHeader = true,
  density,
  compact,
  contentPadding,
  rowPaddingY,
  rowGap,
  linkDisplay = "label",
  mobileTwoColumn = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  rows: FieldRow[];
  emptyText?: string;
  accent?: "blue" | "emerald" | "amber" | "orange" | "violet" | "slate";
  asChips?: boolean;
  showHeader?: boolean;
  density?: PropertyInfoCardDensity;
  compact?: boolean;
  contentPadding?: number | string;
  rowPaddingY?: number | string;
  rowGap?: number | string;
  linkDisplay?: PropertyUrlDisplay;
  mobileTwoColumn?: boolean;
}) {
  const palette = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  }[accent];
  const spacing = spacingFor(density, compact);
  const bodyPadding = toCssSize(contentPadding, spacing.contentPadding);
  const rowPadding = toCssSize(rowPaddingY, spacing.rowPaddingY);
  const gap = toCssSize(rowGap, spacing.rowGap);

  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {showHeader && (
        <div className={`border-b px-5 py-4 ${palette}`}>
          <div className="text-xs font-semibold uppercase tracking-[0.2em]">{eyebrow}</div>
          <h4 className="mt-1 text-lg font-semibold text-slate-950">{title}</h4>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
      )}
      <div style={{ padding: bodyPadding }}>
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            {emptyText}
          </div>
        ) : asChips ? (
          <div className="flex flex-wrap gap-2">
            {rows.map((row) => (
              <span key={row.key} className={`max-w-full break-words rounded-full bg-slate-100 font-medium text-slate-700 ${spacing.chipPadding}`}>
                {row.href ? <LinkValue row={row} mode={linkDisplay} /> : row.value}
              </span>
            ))}
          </div>
        ) : (
          <dl style={{ display: "grid", rowGap: gap }}>
            {rows.map((row) => (
              <div
                key={row.key}
                className={`grid min-w-0 gap-1 border-b border-gray-100 last:border-b-0 ${mobileTwoColumn ? "grid-cols-[96px_minmax(0,1fr)] items-center" : "md:grid-cols-[120px_minmax(0,1fr)]"}`}
                style={{ paddingTop: rowPadding, paddingBottom: rowPadding }}
              >
                <dt className={`min-w-0 break-words text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 ${mobileTwoColumn ? "text-left" : ""}`}>{row.label}</dt>
                <dd className={`min-w-0 break-words text-sm font-medium leading-6 text-gray-900 ${mobileTwoColumn ? "text-right" : ""}`}>
                  <LinkValue row={row} mode={linkDisplay} />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
