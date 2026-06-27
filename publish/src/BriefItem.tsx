import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface BriefItemProps {
  /** Brief headline (single line) */
  title: string;
  /** Time label (e.g. "2m ago", "11:30 AM") */
  time?: string;
  /** Article URL */
  url?: string;
  /** Category/section label */
  category?: string;
  /** Urgency indicator */
  isUrgent?: boolean;

  // StackPage integration
  __stackpage?: StackPageRuntimeApi;
  onClick?: () => void;
}

/**
 * BriefItem — single-line news brief for rapid-scan lists and tickers.
 *
 * Used in newspaper sidebars, "News in Brief" sections, and breaking-news
 * summary lists. Minimal footprint: one-line headline with optional time
 * stamp and urgency dot.
 */
const BriefItem: React.FC<BriefItemProps> = ({
  title,
  time,
  url,
  category,
  isUrgent,
  __stackpage,
  onClick,
}) => {
  const handleClick = () => {
    __stackpage?.emit('select', { id: title, title, contentType: 'news', source: 'brief-item' });
    onClick?.();
  };

  return (
    <article
      className="group flex items-start gap-1 sm:gap-2 border-b border-gray-50 py-2 last:border-b-0 cursor-pointer hover:bg-gray-50/50 flex-wrap"
      onClick={handleClick}
    >
      {/* ── Urgency dot ── */}
      {isUrgent && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
      )}

      {/* ── Category badge ── */}
      {category && !isUrgent && (
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 shrink-0">
          {category}
        </span>
      )}

      {/* ── Headline ── */}
      <p className="flex-1 text-sm leading-snug text-gray-800 group-hover:text-blue-700">
        {url ? (
          <a href={url} className="hover:underline">{title}</a>
        ) : (
          title
        )}
      </p>

      {/* ── Time ── */}
      {time && (
        <span className="shrink-0 text-xs text-gray-400">{time}</span>
      )}
    </article>
  );
};

export default BriefItem;
