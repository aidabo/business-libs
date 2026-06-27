import React, { useState, useEffect } from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";
import { buildRealEstateDetailTransitionPath } from "./utils/urlBuilders";
import type { EstateProperty } from "./types/property";

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

  // ── Filter params ──────────────────────────────────────────────
  propertyType?: "sale" | "rent" | "investment" | "all";
  limit?: number;

  // ── Styling ──────────────────────────────────────────────────────
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

// ── Skeleton ──────────────────────────────────────────────────────

const SliderSkeleton: React.FC = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse">
    <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50/80 px-5 py-4">
      <div className="h-3 w-32 bg-gray-200 rounded" />
      <div className="mt-2 h-5 w-48 bg-gray-200 rounded" />
    </div>
    <div className="flex gap-4 px-5 py-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="min-w-[270px] max-w-[270px] rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="h-44 bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-8 w-20 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);


const normalizeFeatureList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return normalizeFeatureList(parsed);
    } catch {
      // Plain comma/newline separated text below.
    }
    return trimmed
      .split(/\r?\n|、|,|，/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// ── Main component ────────────────────────────────────────────────

export default function PropertySlider({
  title = "Property slider",
  description = "Horizontal premium cards for featured homes and rentals.",
  slides,
  detailPageId = "page-estate-detail",
  selectedPropertyIdKey = "estate.selectedPropertyId",
  propertyType,
  limit: propLimit = 10,
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}: PropertySliderProps) {
  const t = useT();
  const [fetchedSlides, setFetchedSlides] = useState<PropertySliderProps["slides"] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slides && slides.length > 0) {
      setFetchedSlides(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const qs = new URLSearchParams();
    qs.set("public", "1");
    qs.set("limit", String(propLimit));
    const filter = propertyType && propertyType !== "all"
      ? `status:published+property_type:${propertyType}`
      : "status:published";
    qs.set("filter", filter);

    fetch(`/api/estate/properties/?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const items: EstateProperty[] = data?.estateproperties || [];
          setFetchedSlides(
            items.map((p: EstateProperty) => {
              const features = normalizeFeatureList(p.features);
              const featuresImage = (features as string[]).find((f: string) => f.startsWith('__image__:'))?.replace('__image__:', '');
              return {
              id: p.id,
              kind: p.property_type || "property",
              title: p.building_name || p.address || p.id,
              price: p.price_sale
                ? `¥${p.price_sale.toLocaleString()}`
                : p.price_rent_monthly
                  ? `¥${p.price_rent_monthly.toLocaleString()} / 月`
                  : "",
              image: featuresImage
                || p.socialMediaAssets?.[0]?.url
                || (p.property_type === "rent"
                  ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  : p.property_type === "investment"
                  ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  : "https://images.unsplash.com/photo-1600596542815-6ad4c1277855?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
              locationLabel: p.address || "",
              summary: p.layout_description || p.floor_plan || p.nearest_station || "",
            };
            }),
          );
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedSlides([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slides, propertyType, propLimit]);

  const items = (slides && slides.length > 0) ? slides : (fetchedSlides || []);
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

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return <SliderSkeleton />;
  }

  // ── Empty ─────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
        <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50/80 px-5 py-4">
          <h3 className="text-xl font-semibold text-gray-900">{t(title)}</h3>
        </div>
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-400">{t("現在表示できる物件はありません。")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm ${className}`}
      style={{ backgroundColor, fontSize, ...style }}
    >
      <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50/80 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{t(title)}</h3>
            <p className="mt-1 text-sm text-gray-600">{t(description)}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            {t("特選")}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:overflow-x-auto md:[scrollbar-width:thin] md:snap-x">
        {items.map((item: any) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              className={`w-full min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md md:min-w-[270px] md:max-w-[270px] md:shrink-0 md:snap-start ${
                isSelected
                  ? "border-blue-300 ring-2 ring-blue-300 ring-offset-2"
                  : "border-gray-200"
              }`}
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={item.image || item.poster}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  {item.price && (
                    <div className="text-sm font-bold text-white drop-shadow-sm">
                      {item.price}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-medium text-gray-500 line-clamp-1">
                  {t(item.title || "")}
                </div>
                {item.summary && (
                  <p className="mt-1.5 text-xs text-gray-400 line-clamp-1">{t(item.summary)}</p>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400 truncate">{t(item.locationLabel || "")}</span>
                  <button
                    type="button"
                    onClick={() => openDetail(item)}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    {t("詳細")} →
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
