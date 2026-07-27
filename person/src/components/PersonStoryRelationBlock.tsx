"use client";

import {
  getPersonStoryReferenceExamples,
  selectPersonStoryReferenceExample,
} from "../data/referenceExamples";

type PersonStoryRelationBlockProps = {
  referenceId?: string;
  query?: string;
  compact?: boolean;
};

export default function PersonStoryRelationBlock({
  referenceId = "yamada-sakura",
  query = "",
  compact = false,
}: PersonStoryRelationBlockProps) {
  const references = getPersonStoryReferenceExamples();
  const reference =
    references.find((item) => item.id === referenceId) ||
    selectPersonStoryReferenceExample(query) ||
    references[0];

  return (
    <section className={`rounded-2xl border border-amber-100 bg-white p-4 shadow-sm ${compact ? "max-w-4xl" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Relation map
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">{reference.subject}</h3>
        </div>
        <a
          href={`/ai/person-story?ref=${encodeURIComponent(reference.id)}`}
          className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
        >
          Open archive
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {reference.themes.map((theme) => (
          <span
            key={theme}
            className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"
          >
            {theme}
          </span>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-sm text-gray-700">
        <p className="font-semibold text-gray-900">Structural notes</p>
        <ul className="mt-2 space-y-2">
          {reference.structuralNotes.slice(0, 2).map((note) => (
            <li key={note} className="rounded-lg bg-white px-3 py-2 ring-1 ring-amber-100">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
