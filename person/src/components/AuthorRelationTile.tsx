"use client";

import { getCanonicalPersonHref } from "../utils/routeAdapters";

type RelationTileProps = {
  id: number | string;
  name: string;
  title?: string;
  avatar?: string;
  authorSlug?: string;
  storyCount?: number;
  relationLabel?: string;
  compact?: boolean;
  subjectType?: string;
};

function RelationContent({
  name,
  title,
  avatar,
  storyCount,
  relationLabel,
  compact = false,
  subjectType,
}: Pick<
  RelationTileProps,
  "name" | "title" | "avatar" | "storyCount" | "relationLabel" | "compact" | "subjectType"
>) {
  const isLegend = subjectType === "fictional";
  return (
    <div className={`flex items-center gap-3 ${compact ? "" : ""}`}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          width={compact ? 40 : 48}
          height={compact ? 40 : 48}
          className={
            compact
              ? "h-10 w-10 rounded-full object-cover"
              : "h-12 w-12 rounded-full object-cover"
          }
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full ${
            isLegend
              ? "bg-gradient-to-br from-slate-800 to-amber-700"
              : "bg-gradient-to-br from-amber-100 to-orange-100"
          } ${
            compact ? "h-10 w-10" : "h-12 w-12"
          }`}
        >
          👤
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <strong className="truncate text-sm text-gray-900">{name}</strong>
          {relationLabel ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                isLegend
                  ? "bg-amber-200/10 text-amber-100 ring-1 ring-amber-300/20"
                  : "bg-gray-900 text-amber-100"
              }`}
            >
              {relationLabel}
            </span>
          ) : null}
          {typeof storyCount === "number" ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
              {storyCount} 篇
            </span>
          ) : null}
        </div>
        {title ? <p className="truncate text-sm text-gray-600">{title}</p> : null}
      </div>
    </div>
  );
}

export default function AuthorRelationTile({
  name,
  title,
  avatar,
  authorSlug,
  storyCount,
  relationLabel,
  compact = false,
  subjectType,
}: RelationTileProps) {
  const content = (
    <RelationContent
      name={name}
      title={title}
      avatar={avatar}
      storyCount={storyCount}
      relationLabel={relationLabel}
      compact={compact}
      subjectType={subjectType}
    />
  );
  const isLegend = subjectType === "fictional";

  const href = getCanonicalPersonHref({
    slug: authorSlug || null,
  });
  const legendBadge = isLegend ? (
    <div className="mb-2 inline-flex rounded-full bg-amber-200/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100 ring-1 ring-amber-300/20">
      Mythic relation
    </div>
  ) : null;

  if (!href) {
    return (
      <div
        className={`rounded-xl border px-3 py-3 ${
          isLegend
            ? "border-slate-300/20 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950"
          : "border-amber-100 bg-gradient-to-r from-white via-white to-amber-50"
        } ${compact ? "" : ""}`}
      >
        {legendBadge}
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      className={`rounded-xl border px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-md ${
        isLegend
          ? "border-slate-300/20 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 hover:border-amber-300/40"
          : "border-amber-100 bg-gradient-to-r from-white via-white to-amber-50 hover:border-amber-300"
      } ${compact ? "block" : "flex"}`}
    >
      {legendBadge}
      {content}
    </a>
  );
}
