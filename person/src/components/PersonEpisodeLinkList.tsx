"use client";

import { useEffect, useState } from "react";

type EpisodeItem = {
  id: string;
  slug?: string | null;
  title: string;
  summary?: string | null;
  episode_no?: number | null;
  episode_type?: string | null;
  post_id?: string | null;
  published_at?: string | null;
  sort_order?: number | null;
};

type PersonEpisodeLinkListProps = {
  slug: string;
  subject: string;
};

const formatEpisodeNumber = (no?: number | null) => {
  if (no == null) return "";
  return `#${String(no).padStart(2, "0")}`;
};

const episodeTypeColor = (type?: string | null) => {
  switch (type) {
    case "prologue": return "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200";
    case "chapter": return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
    case "interlude": return "bg-purple-100 text-purple-800 ring-1 ring-purple-200";
    case "epilogue": return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
    case "supplement": return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    default: return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  }
};

const episodeTypeLabel = (type?: string | null) => {
  switch (type) {
    case "chapter": return "Chapter";
    case "interlude": return "Interlude";
    case "prologue": return "Prologue";
    case "epilogue": return "Epilogue";
    case "supplement": return "Supplement";
    default: return type || "Chapter";
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("ja-JP", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return value; }
};

export default function PersonEpisodeLinkList({ slug, subject }: PersonEpisodeLinkListProps) {
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        // Step 1: Find person by slug
        const personRes = await fetch(
          `/api/person/persons/?filter=${encodeURIComponent(`slug:'${slug}'`)}&limit=1`,
          { cache: "no-store" },
        );
        if (!personRes.ok) throw new Error("Backend unavailable");
        const personJson = await personRes.json();
        const persons = Array.isArray(personJson?.data) ? personJson.data : [];
        const person = persons[0];
        if (!person?.id) throw new Error("Person not found in backend");

        // Step 2: Fetch episodes for this person
        const epRes = await fetch(
          `/api/person/episodes/?filter=${encodeURIComponent(`person_id:'${person.id}'`)}&order=sort_order asc&limit=all`,
          { cache: "no-store" },
        );
        if (!epRes.ok) throw new Error("Episodes unavailable");
        const epJson = await epRes.json();
        const items = Array.isArray(epJson?.data) ? epJson.data : [];
        if (!active) return;
        setEpisodes(items);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load episodes");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <section className="rounded-2xl border border-amber-100 bg-white/60 p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
          <span className="text-sm text-gray-500">Loading episodes...</span>
        </div>
      </section>
    );
  }

  // Error or empty state (backend unavailable / no episodes)
  if (error || episodes.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/30 p-6 text-center">
        <p className="text-sm text-gray-500">
          {error
            ? `Episode data unavailable — ${error}`
            : `No episodes linked for ${subject} in the backend.`}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Episodes must be registered in the Ghost CMS backend to appear here with links.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
            Episode links
          </p>
          <h2 className="text-base font-bold text-gray-900">
            Read full episodes
          </h2>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
          {episodes.length} episodes
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {episodes.map((ep) => (
          <a
            key={ep.id}
            href={`/person/episodes/${encodeURIComponent(ep.id)}`}
            className="group block rounded-xl border border-amber-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {ep.episode_no != null && (
                  <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                    {formatEpisodeNumber(ep.episode_no)}
                  </span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${episodeTypeColor(ep.episode_type)}`}>
                  {episodeTypeLabel(ep.episode_type)}
                </span>
              </div>
              {ep.published_at && (
                <span className="shrink-0 text-[10px] text-gray-400">
                  {formatDate(ep.published_at)}
                </span>
              )}
            </div>

            <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
              {ep.title}
            </h3>

            {ep.summary && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                {ep.summary}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-600 opacity-0 transition-opacity group-hover:opacity-100">
              Read episode →
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
