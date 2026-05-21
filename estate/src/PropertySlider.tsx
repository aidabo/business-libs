import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { buildRealEstateDetailTransitionPath } from "./utils/urlBuilders";

export interface PropertySliderProps {
  title?: string;
  description?: string;
  slides?: Array<{
    id: string;
    kind?: string;
    title?: string;
    summary?: string;
    body?: string;
    price?: string;
    area?: string;
    rooms?: string;
    status?: string;
    image?: string;
    poster?: string;
    video?: string;
    locationLabel?: string;
  }>;
  detailPageId?: string;
  selectedPropertyIdKey?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

export default function PropertySlider({
  title = "Property slider",
  description = "Horizontal premium cards for featured homes and rentals.",
  slides,
  detailPageId = "page-estate-detail",
  selectedPropertyIdKey = "estate.selectedPropertyId",
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}: PropertySliderProps) {
  const t = useT();
  const items = slides || [];
  const selectedId = String(__stackpage?.getPageState?.(selectedPropertyIdKey, "") || "");

  const openDetail = (item: any) => {
    const path = buildRealEstateDetailTransitionPath(detailPageId, item.id, "slider-card");
    __stackpage?.setPageState?.(selectedPropertyIdKey, item.id);
    __stackpage?.emit?.("estate:property:selected", {
      id: item.id,
      kind: item.kind || "property",
      title: item.title || item.id,
      locationLabel: item.locationLabel || "",
      source: "slider-card",
    });
    if (typeof window !== "undefined") {
      window.location.assign(path);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm ${className}`}
      style={{ backgroundColor, fontSize, ...style }}
    >
      <div className="bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
              {t("Horizontal property slider")}
            </div>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{t(title)}</h3>
            <p className="mt-1 text-sm text-slate-600">{t(description)}</p>
          </div>
          <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">
            {t("swipe")}
          </span>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto px-5 py-5 [scrollbar-width:thin]">
        {items.map((item: any) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              className={`min-w-[270px] max-w-[270px] shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm snap-start transition ${
                isSelected
                  ? "border-rose-300 ring-2 ring-rose-300 ring-offset-2 ring-offset-white"
                  : "border-slate-200"
              }`}
            >
              <div className="relative h-44">
                <img
                  src={item.image || item.poster}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    {t(item.kind || "property")}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">{t(item.title)}</div>
                  {isSelected ? (
                    <span className="mt-2 inline-flex rounded-full bg-rose-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                      {t("Selected property")}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600">{t(item.summary || "")}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">{t(item.locationLabel || "")}</span>
                  <button
                    type="button"
                    onClick={() => openDetail(item)}
                    className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    {t("Open detail")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
