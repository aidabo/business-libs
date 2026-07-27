"use client";

import { getEpisodeStageLabel } from "../utils/storySeries";

type StoryEpisode = {
  id: number | string;
  episodeId?: number | string | null;
  title: string;
  excerpt?: string;
  published_at?: string;
};

type StoryEpisodeSection = {
  title: string;
  description?: string;
  episodes: StoryEpisode[];
};

type AuthorEpisodeListProps = {
  title: string;
  description?: string;
  episodes?: StoryEpisode[];
  sections?: StoryEpisodeSection[];
  emptyText?: string;
  className?: string;
  subjectType?: string;
};

function formatEpisodeNumber(index: number) {
  return `第 ${String(index + 1).padStart(2, "0")} 话`;
}

export default function AuthorEpisodeList({
  title,
  description,
  episodes = [],
  sections = [],
  emptyText = "暂无连载故事。",
  className = "",
  subjectType,
}: AuthorEpisodeListProps) {
  const isLegend = subjectType === "fictional";
  const renderEpisodeCard = (episode: StoryEpisode, index: number, total: number) => {
    const href = episode.episodeId
      ? `/person/episodes/${encodeURIComponent(String(episode.episodeId))}`
      : `/article/${encodeURIComponent(String(episode.id))}`;
    return (
      <a
        key={episode.id}
        href={href}
        className={`group block rounded-xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md ${
          isLegend
            ? "border-slate-300/20 bg-slate-950/60 text-amber-50 hover:border-amber-300/40 hover:bg-slate-900"
            : "border-amber-100 bg-white hover:border-amber-300 hover:bg-amber-50"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                isLegend
                  ? "bg-amber-200/10 text-amber-100 ring-1 ring-amber-300/20"
                  : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900"
              }`}
            >
              {formatEpisodeNumber(index)} · {getEpisodeStageLabel(index, total)}
            </span>
            <strong
              className={`truncate text-sm ${
                isLegend ? "text-amber-50 group-hover:text-amber-200" : "text-gray-900 group-hover:text-amber-900"
              }`}
            >
              {episode.title}
            </strong>
          </div>
          <span className={`shrink-0 text-xs ${isLegend ? "text-amber-200/80" : "text-gray-500"}`}>
            {episode.published_at || ""}
          </span>
        </div>
        {episode.excerpt ? (
          <p className={`mt-1 line-clamp-2 text-sm ${isLegend ? "text-amber-50/80" : "text-gray-700"}`}>
            {episode.excerpt}
          </p>
        ) : null}
      </a>
    );
  };

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm ${
        isLegend
          ? "border-slate-300/20 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950"
          : "border-amber-100 bg-gradient-to-br from-stone-50 via-white to-amber-50"
      } ${className}`.trim()}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
              isLegend
                ? "bg-amber-200/10 text-amber-100 ring-1 ring-amber-300/20"
                : "bg-gray-900 text-amber-100"
            }`}
          >
            {isLegend ? "Legend Vol." : "Vol."}
          </div>
          {isLegend ? (
            <div className="mt-2 inline-flex rounded-full bg-amber-200/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100 ring-1 ring-amber-300/20">
              Mythic chapters
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
              ? "bg-amber-200/10 ring-amber-300/20"
              : "bg-amber-100/70 ring-amber-200"
          }`}
        />
      </div>
      {description ? (
        <p className={`mt-1 text-sm ${isLegend ? "text-amber-100/80" : "text-gray-600"}`}>
          {description}
        </p>
      ) : null}

      {sections.length > 0 ? (
        <div className="mt-4 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className={`rounded-xl border p-3 shadow-sm ${
                isLegend
                  ? "border-slate-300/20 bg-slate-950/55"
                  : "border-amber-100 bg-white/95"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      isLegend ? "text-amber-50" : "text-gray-900"
                    }`}
                  >
                    {section.title}
                  </h4>
                  {section.description ? (
                    <p className={`mt-1 text-xs ${isLegend ? "text-amber-100/70" : "text-gray-600"}`}>
                      {section.description}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isLegend
                      ? "bg-amber-200/10 text-amber-100 ring-1 ring-amber-300/20"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {section.episodes.length} 篇
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {section.episodes.map((episode, index) =>
                  renderEpisodeCard(episode, index, section.episodes.length),
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {episodes.length > 0 ? (
            episodes.map((episode, index) =>
              renderEpisodeCard(episode, index, episodes.length),
            )
          ) : (
            <p className="text-sm text-gray-500">{emptyText}</p>
          )}
        </div>
      )}
    </article>
  );
}
