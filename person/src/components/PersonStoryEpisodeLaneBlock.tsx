"use client";

import {
  buildPersonStoryStructureOutlineFromReference,
  getPersonStoryReferenceExamples,
  selectPersonStoryReferenceExample,
} from "../data/referenceExamples";

type PersonStoryEpisodeLaneBlockProps = {
  referenceId?: string;
  query?: string;
  compact?: boolean;
};

export default function PersonStoryEpisodeLaneBlock({
  referenceId = "lin-zhiyuan",
  query = "",
  compact = false,
}: PersonStoryEpisodeLaneBlockProps) {
  const references = getPersonStoryReferenceExamples();
  const reference =
    references.find((item) => item.id === referenceId) ||
    selectPersonStoryReferenceExample(query) ||
    references[0];
  const outline = buildPersonStoryStructureOutlineFromReference(reference);
  const volumes = outline.filter((item) => item.kind === "volume");

  return (
    <section className={`rounded-2xl border border-amber-100 bg-white p-4 shadow-sm ${compact ? "max-w-4xl" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Episode lane
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">{reference.title}</h3>
        </div>
        <a
          href={`/ai/person-story?ref=${encodeURIComponent(reference.id)}`}
          className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
        >
          Open preview
        </a>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {volumes.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                Lane {String(index + 1).padStart(2, "0")}
              </span>
              {typeof item.chapterCount === "number" ? (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                  {item.chapterCount} ch.
                </span>
              ) : null}
            </div>
            <h4 className="mt-3 text-sm font-semibold text-gray-900">{item.title}</h4>
            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
