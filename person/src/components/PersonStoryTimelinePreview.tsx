"use client";

import type {
  PersonStoryReferenceExample,
  PersonStoryStructureOutlineItem,
} from "../data/referenceExamples";

type PersonStoryTimelinePreviewProps = {
  reference: PersonStoryReferenceExample;
  references: PersonStoryReferenceExample[];
  structureOutline: PersonStoryStructureOutlineItem[];
  referenceHrefBase?: string;
};

function kindLabel(kind: PersonStoryStructureOutlineItem["kind"]) {
  if (kind === "intro") return "Intro";
  if (kind === "timeline") return "Timeline";
  if (kind === "supplement") return "Supplement";
  if (kind === "afterword") return "Afterword";
  return "Volume";
}

function kindTone(kind: PersonStoryStructureOutlineItem["kind"]) {
  if (kind === "intro") return "bg-amber-100 text-amber-900 ring-1 ring-amber-200";
  if (kind === "timeline") return "bg-orange-100 text-orange-900 ring-1 ring-orange-200";
  if (kind === "supplement") return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  if (kind === "afterword") return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
  return "bg-white text-amber-800 ring-1 ring-amber-200";
}

export default function PersonStoryTimelinePreview({
  reference,
  references,
  structureOutline,
  referenceHrefBase,
}: PersonStoryTimelinePreviewProps) {
  const buildReferenceHref = (item: PersonStoryReferenceExample) =>
    referenceHrefBase
      ? `${referenceHrefBase.replace(/\/+$/, "")}/${encodeURIComponent(item.id)}`
      : `/ai/person-story?ref=${encodeURIComponent(item.id)}`;
  const introItem = structureOutline.find((item) => item.kind === "intro");
  const timelineItem = structureOutline.find((item) => item.kind === "timeline");
  const volumeItems = structureOutline.filter((item) => item.kind === "volume");
  const supplementItem = structureOutline.find((item) => item.kind === "supplement");
  const afterwordItem = structureOutline.find((item) => item.kind === "afterword");

  return (
    <section className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-3 shadow-sm sm:p-4 lg:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="inline-flex rounded-full bg-gray-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-100">
            Episode timeline preview
          </div>
          <h1 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {reference.title}
          </h1>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {reference.subject} · {reference.summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
              {reference.language === "ja" ? "Japanese source" : "Chinese source"}
            </span>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
              {reference.timeSpan}
            </span>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
              {reference.volumeCount} volumes
            </span>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
              {reference.chapterCount} chapters
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white/90 p-3 shadow-sm lg:w-72">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
            Reference switch
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {references.map((item) => {
              const active = item.id === reference.id;
              return (
                <a
                  key={item.id}
                  href={buildReferenceHref(item)}
                  className={`rounded-xl border px-2.5 py-1.5 text-left text-xs transition ${
                    active
                      ? "border-amber-300 bg-amber-50 text-amber-950 shadow-sm"
                      : "border-amber-100 bg-white text-gray-700 hover:border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-xs">{item.title}</strong>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-amber-700">
                      {item.language}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
                    {item.subject} · {item.timeSpan}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
        <article className="rounded-2xl border border-amber-100 bg-white/85 p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                Structure outline
              </p>
              <h2 className="text-base font-bold text-gray-900">
                Story flow as a timeline
              </h2>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
              {reference.timelineHtml}
            </span>
          </div>

          <div className="relative mt-3 space-y-2 pl-4">
            <span className="absolute left-[7px] top-0 h-full w-px bg-gradient-to-b from-amber-300 via-orange-300 to-amber-200" />
            {structureOutline.map((item, index) => (
              <section
                key={`${item.kind}-${index}-${item.title}`}
                className="relative rounded-xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/70 p-3 shadow-sm"
              >
                <span className="absolute -left-[1.05rem] top-4 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500 shadow" />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${kindTone(item.kind)}`}>
                    {kindLabel(item.kind)}
                  </span>
                  {typeof item.chapterCount === "number" ? (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
                      {item.chapterCount} chapters
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-xs leading-5 text-gray-600">
                  {item.description}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                  Reading order
                </p>
                <p className="text-xs text-gray-700">
                  A timeline-like flow from opening to afterword.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[introItem, timelineItem, supplementItem, afterwordItem]
                  .filter(Boolean)
                  .map((item) => (
                    <span
                      key={`${item?.kind}-${item?.title}`}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${kindTone(item!.kind)}`}
                    >
                      {item?.title}
                    </span>
                  ))}
              </div>
            </div>
            {volumeItems.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {volumeItems.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-xl border border-amber-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                        Lane {String(index + 1).padStart(2, "0")}
                      </span>
                      {typeof item.chapterCount === "number" ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                          {item.chapterCount} ch
                        </span>
                      ) : null}
                    </div>
                    <h4 className="mt-2 text-sm font-semibold text-gray-900">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-text-gray-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </article>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-amber-100 bg-white/90 p-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
              Reference details
            </p>
            <dl className="mt-2 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <dt className="text-gray-500">Subject</dt>
                <dd className="text-right font-medium text-gray-900">{reference.subject}</dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-gray-500">Source</dt>
                <dd className="text-right font-medium text-gray-900 truncate max-w-[160px]" title={reference.sourcePath}>{reference.sourcePath}</dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-gray-500">Timeline HTML</dt>
                <dd className="text-right font-medium text-gray-900">{reference.timelineHtml}</dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-gray-500">Geography</dt>
                <dd className="text-right font-medium text-gray-900">{reference.geography}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-amber-100 bg-white/90 p-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
              Structural notes
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-gray-700">
              {reference.structuralNotes.map((note) => (
                <li key={note} className="rounded-lg bg-amber-50 px-2.5 py-1.5">
                  {note}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-100 bg-white/90 p-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
              Theme chips
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reference.themes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900"
                >
                  {theme}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
