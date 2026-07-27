"use client";

import {
  getLifeEventPhaseLabel,
  sortLifeEvents,
  type LifeEvent,
} from "../utils/storySeries";

type AuthorLifeTimelineProps = {
  title: string;
  description?: string;
  lifeEvents?: LifeEvent[];
  emptyText?: string;
  className?: string;
  subjectType?: string;
};

function formatYear(year: number) {
  if (!Number.isFinite(year)) return "";
  if (year < 0) return `${Math.abs(year)} BCE`;
  return String(year);
}

export default function AuthorLifeTimeline({
  title,
  description,
  lifeEvents = [],
  emptyText = "暂无年表数据。",
  className = "",
  subjectType,
}: AuthorLifeTimelineProps) {
  const sortedLifeEvents = sortLifeEvents(lifeEvents);
  const isLegend = subjectType === "fictional";

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm ${
        isLegend
          ? "border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-amber-50"
          : "border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50"
      } ${className}`.trim()}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
              isLegend
                ? "bg-amber-400/20 text-amber-200 ring-1 ring-amber-300/30"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isLegend ? "Legend" : "Chronicle"}
          </div>
          {isLegend ? (
            <div className="mt-2 inline-flex rounded-full bg-amber-200/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100 ring-1 ring-amber-300/20">
              Mythic archive
            </div>
          ) : null}
          <h3
            className={`mt-2 text-lg font-bold ${
              isLegend ? "text-amber-50" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
        </div>
        <div
          className={`h-10 w-10 rounded-full ring-1 ${
            isLegend
              ? "bg-amber-200/10 ring-amber-200/20"
              : "bg-white/90 ring-amber-200"
          }`}
        />
      </div>
      {description ? (
        <p
          className={`mt-1 text-sm ${
            isLegend ? "text-amber-100/80" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {sortedLifeEvents.length > 0 ? (
          sortedLifeEvents.map((event, index) => (
            <div
              key={`${event.year}-${event.title}`}
              className={`relative overflow-hidden rounded-xl border px-4 py-3 shadow-[0_1px_0_rgba(217,119,6,0.06)] ${
                isLegend
                  ? "border-amber-300/20 bg-slate-950/60"
                  : "border-amber-200 bg-white/90"
              }`}
            >
              <span
                className={`absolute inset-y-0 left-0 w-1.5 ${
                  isLegend
                    ? "bg-gradient-to-b from-amber-200 via-yellow-300 to-orange-500"
                    : "bg-gradient-to-b from-amber-300 via-amber-400 to-orange-400"
                }`}
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <strong
                    className={`text-sm ${
                      isLegend ? "text-amber-100" : "text-amber-900"
                    }`}
                  >
                    {formatYear(event.year)}
                  </strong>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      isLegend
                        ? "bg-amber-200/10 text-amber-100 ring-1 ring-amber-300/20"
                        : "bg-white text-amber-800 ring-1 ring-amber-200"
                    }`}
                  >
                    {getLifeEventPhaseLabel(index, sortedLifeEvents.length)}
                  </span>
                </div>
                <span
                  className={`text-xs ${
                    isLegend ? "text-amber-200/80" : "text-amber-600"
                  }`}
                >
                  {event.title}
                </span>
              </div>
              <p
                className={`mt-1 text-sm ${
                  isLegend ? "text-amber-50/80" : "text-gray-700"
                }`}
              >
                {event.description}
              </p>
            </div>
          ))
        ) : (
          <p className={`text-sm ${isLegend ? "text-amber-100/80" : "text-gray-500"}`}>
            {emptyText}
          </p>
        )}
      </div>
    </article>
  );
}
