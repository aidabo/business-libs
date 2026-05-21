import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { buildGoogleMapsStreetViewUrl, buildGoogleMapsMapUrl } from "./utils/urlBuilders";

export interface AccessCardProps {
  title?: string;
  description?: string;
  items?: Array<{
    id: string;
    kind?: string;
    title?: string;
    summary?: string;
    locationLabel?: string;
    locationSpotId?: string;
  }>;
  spots?: Array<{
    id: string;
    kind?: string;
    locationLabel?: string;
    viewpoint?: string;
    heading?: number;
    pitch?: number;
    fov?: number;
    center?: string;
    zoom?: number;
  }>;
  selectedPropertyIdKey?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

export default function AccessCard({
  title = "Access and location",
  description = "Street view, map, and quick property context in one calm panel.",
  items,
  spots,
  selectedPropertyIdKey = "estate.selectedPropertyId",
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}: AccessCardProps) {
  const t = useT();
  const selectedId = String(__stackpage?.getPageState?.(selectedPropertyIdKey, "") || "");
  const selectedItem = (items || []).find((item) => item.id === selectedId) || (items || [])[0] || null;
  const selectedSpot = selectedItem && spots
    ? spots.find((spot) => spot.id === selectedItem.locationSpotId)
    : null;

  if (!selectedItem) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm ${className}`}
      style={{ backgroundColor, fontSize, ...style }}
    >
      <div className="bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              {t("Access panel")}
            </div>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{t(title)}</h3>
            <p className="mt-1 text-sm text-slate-600">{t(description)}</p>
          </div>
          <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            {selectedItem.locationLabel || t("Location")}
          </span>
        </div>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {t("Street preview")}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {selectedSpot?.locationLabel || selectedItem.locationLabel || t("Street view")}
            </div>
            <p className="mt-2 text-xs text-slate-600">
              {t("Open the panoramic street view for entrances and surrounding context.")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {t("Map check")}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{t("Transit and commute")}</div>
            <p className="mt-2 text-xs text-slate-600">
              {t("Check the map before scheduling a property visit.")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {t("Detail route")}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {selectedItem.kind ? t(selectedItem.kind === "sale" ? "For Sale" : "For Rent") : t("Property")}
            </div>
            <p className="mt-2 text-xs text-slate-600">
              {t("Open the detail page for full property reading.")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {selectedSpot?.viewpoint ? (
            <a
              href={buildGoogleMapsStreetViewUrl({
                viewpoint: selectedSpot.viewpoint,
                heading: selectedSpot.heading || 175,
                pitch: selectedSpot.pitch || 8,
                fov: selectedSpot.fov || 75,
              })}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
            >
              {t("Open Street View")}
            </a>
          ) : null}
          {selectedSpot?.center ? (
            <a
              href={buildGoogleMapsMapUrl({
                center: selectedSpot.center,
                zoom: selectedSpot.zoom || 16,
              })}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
            >
              {t("Open map")}
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => __stackpage?.emit?.("estate:property:selected", { id: selectedItem.id, source: "access-card" })}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            {t("Inspect property")}
          </button>
        </div>
      </div>
    </div>
  );
}
