import React from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

export interface NeighborhoodProfile {
  commute: string;
  walk: string;
  vibe: string;
  nearby: string[];
}

export interface NeighborhoodItem {
  id: string;
  kind?: string;
  title?: string;
  summary?: string;
  locationLabel?: string;
  price?: string;
}

export interface NeighborhoodCardProps {
  title?: string;
  description?: string;
  items?: NeighborhoodItem[];
  /** Map of locationLabel → profile data. When provided, overrides the hardcoded fallback. */
  profiles?: Record<string, NeighborhoodProfile>;
  selectedPropertyIdKey?: string;
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

/** Fallback hardcoded profiles (used when no `profiles` prop is given) */
const FALLBACK_PROFILES: Record<string, NeighborhoodProfile> = {
  Shibuya: { commute: "JR / Metro access", walk: "5 min walk to station", nearby: ["Transit hub", "Dining", "Shopping"], vibe: "Urban and premium" },
  Nakameguro: { commute: "Tens of cafes nearby", walk: "7 min walk to station", nearby: ["River walk", "Cafes", "Design studios"], vibe: "Creative and calm" },
  Daikanyama: { commute: "Quiet residential streets", walk: "8 min walk to station", nearby: ["Boutiques", "Green pockets", "Fine dining"], vibe: "Boutique and refined" },
  Yokohama: { commute: "Family-friendly access", walk: "12 min walk to station", nearby: ["Park", "Schools", "Supermarket"], vibe: "Spacious and practical" },
};

const DEFAULT_PROFILE: NeighborhoodProfile = {
  commute: "Convenient local access",
  walk: "10 min walk to station",
  nearby: ["Station", "Cafe", "Park"],
  vibe: "Well balanced",
};

function matchLabel(label: string): string | undefined {
  return Object.keys(FALLBACK_PROFILES).find((key) => label.includes(key));
}

function getAreaProfile(
  item?: NeighborhoodItem,
  profiles?: Record<string, NeighborhoodProfile>,
): NeighborhoodProfile {
  const label = String(item?.locationLabel || "");
  if (!label) return DEFAULT_PROFILE;

  // 1. Try explicit profiles prop first
  if (profiles) {
    if (profiles[label]) return profiles[label];
    // Try fuzzy match in profiles
    const key = Object.keys(profiles).find((k) => label.includes(k));
    if (key) return profiles[key];
    return DEFAULT_PROFILE;
  }

  // 2. Fall back to hardcoded lookup
  const matched = matchLabel(label);
  return matched ? FALLBACK_PROFILES[matched] : DEFAULT_PROFILE;
}

export default function NeighborhoodCard({
  title = "Neighborhood guide",
  description = "A calm area summary for the selected property with nearby points of interest.",
  items,
  profiles,
  selectedPropertyIdKey = "estate.selectedPropertyId",
  backgroundColor,
  fontSize,
  className = "",
  style,
  __stackpage,
}: NeighborhoodCardProps) {
  const t = useT();
  const selectedId = String(__stackpage?.getPageState?.(selectedPropertyIdKey, "") || "");
  const selectedItem = (items || []).find((item) => item.id === selectedId) || (items || [])[0] || null;
  const profile = getAreaProfile(selectedItem || undefined, profiles);

  if (!selectedItem) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm ${className}`}
      style={{ backgroundColor, fontSize, ...style }}
    >
      <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              {t("Area context")}
            </div>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{t(title)}</h3>
            <p className="mt-1 text-sm text-slate-600">{t(description)}</p>
          </div>
          <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
            {selectedItem.locationLabel || t("Neighborhood")}
          </span>
        </div>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-500">
              {t("Commute")}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{t(profile.commute)}</div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-500">
              {t("Walk time")}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{t(profile.walk)}</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-500">
              {t("Vibe")}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{t(profile.vibe)}</div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-500">
              {t("Nearby")}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {profile.nearby.map((poi) => (
                <span key={poi} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  {t(poi)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
