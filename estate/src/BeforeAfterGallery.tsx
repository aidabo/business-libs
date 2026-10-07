import React, { useState } from "react";
import { useT } from "./hooks/useTranslation";
import type { StackPageRuntimeApi } from "./types";

export interface BeforeAfterRoom {
  label: string;
  beforeImage: string;
  afterImage: string;
}

export interface BeforeAfterGalleryProps {
  title?: string;
  description?: string;
  projectTitle?: string;
  projectDescription?: string;
  location?: string;
  completionDate?: string;
  rooms?: BeforeAfterRoom[];
  backgroundColor?: string;
  fontSize?: string;
  className?: string;
  style?: React.CSSProperties;
  __stackpage?: StackPageRuntimeApi;
}

const DEFAULT_ROOMS: BeforeAfterRoom[] = [
  {
    label: "外観",
    beforeImage: "https://placehold.co/800x500/d1d5db/6b7280?text=外観+Before",
    afterImage: "https://placehold.co/800x500/bfdbfe/1d4ed8?text=外観+After",
  },
  {
    label: "リビング",
    beforeImage: "https://placehold.co/800x500/d1d5db/6b7280?text=リビング+Before",
    afterImage: "https://placehold.co/800x500/bfdbfe/1d4ed8?text=リビング+After",
  },
  {
    label: "キッチン",
    beforeImage: "https://placehold.co/800x500/d1d5db/6b7280?text=キッチン+Before",
    afterImage: "https://placehold.co/800x500/bfdbfe/1d4ed8?text=キッチン+After",
  },
  {
    label: "トイレ",
    beforeImage: "https://placehold.co/800x500/d1d5db/6b7280?text=トイレ+Before",
    afterImage: "https://placehold.co/800x500/bfdbfe/1d4ed8?text=トイレ+After",
  },
  {
    label: "洗面所",
    beforeImage: "https://placehold.co/800x500/d1d5db/6b7280?text=洗面所+Before",
    afterImage: "https://placehold.co/800x500/bfdbfe/1d4ed8?text=洗面所+After",
  },
  {
    label: "洋室",
    beforeImage: "https://placehold.co/800x500/d1d5db/6b7280?text=洋室+Before",
    afterImage: "https://placehold.co/800x500/bfdbfe/1d4ed8?text=洋室+After",
  },
];

const BeforeAfterGallery: React.FC<BeforeAfterGalleryProps> = ({
  title = "施工前後ギャラリー",
  description = "各部屋の施工前・施工後の写真をご覧いただけます。",
  projectTitle = "横浜市 2LDK マンション フルリノベーション",
  projectDescription,
  location,
  completionDate,
  rooms,
  backgroundColor,
  fontSize,
  className = "",
  style,
}) => {
  const t = useT();
  const displayRooms = rooms ?? DEFAULT_ROOMS;
  const [activeRoom, setActiveRoom] = useState(0);

  const mergedStyle: React.CSSProperties = { backgroundColor, fontSize, ...style };
  const room = displayRooms[activeRoom];
  if (!room) return null;

  return (
    <section className={`w-full ${className}`} style={mergedStyle}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        {(title || description) && (
          <div className="mb-8 text-center">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t(title)}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-sm text-slate-500">{t(description)}</p>
            )}
          </div>
        )}

        {/* Project info bar */}
        {(projectTitle || location || completionDate) && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
            {projectTitle && (
              <span className="font-semibold text-slate-800">{t(projectTitle)}</span>
            )}
            {location && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
            )}
            {completionDate && (
              <span className="text-xs text-slate-500">{t("Completed")}: {completionDate}</span>
            )}
          </div>
        )}

        {/* Room tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {displayRooms.map((r, i) => (
            <button
              key={i}
              onClick={() => setActiveRoom(i)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                i === activeRoom
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Before / After side-by-side */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between bg-slate-700 px-4 py-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                {t("Before")}
              </span>
              <span className="text-xs text-slate-400">{room.label}</span>
            </div>
            <img
              src={room.beforeImage}
              alt={`${room.label} ${t("Before")}`}
              className="aspect-video w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-blue-200">
            <div className="flex items-center justify-between bg-blue-600 px-4 py-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-100">
                {t("After")}
              </span>
              <span className="text-xs text-blue-200">{room.label}</span>
            </div>
            <img
              src={room.afterImage}
              alt={`${room.label} ${t("After")}`}
              className="aspect-video w-full object-cover"
            />
          </div>
        </div>

        {/* Project description */}
        {projectDescription && (
          <p className="mt-6 text-sm leading-7 text-slate-600">{projectDescription}</p>
        )}
      </div>
    </section>
  );
};

BeforeAfterGallery.displayName = "BeforeAfterGallery";
export default BeforeAfterGallery;
