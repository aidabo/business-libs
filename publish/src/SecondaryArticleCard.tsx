import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface SecondaryArticleCardProps {
  /** Article headline */
  title: string;
  /** Article excerpt / summary */
  excerpt?: string;
  /** Newspaper section label */
  section?: string;
  /** Author byline */
  author?: string;
  /** Publication date */
  publishedAt?: string;
  /** Article URL */
  url?: string;

  // StackPage integration
  __stackpage?: StackPageRuntimeApi;
  onClick?: () => void;
}

/**
 * SecondaryArticleCard — compact text-only news article card.
 *
 * Used for secondary stories on section pages and newspaper interior pages.
 * No image — headline and excerpt only, with a subtle bottom border.
 */
const SecondaryArticleCard: React.FC<SecondaryArticleCardProps> = ({
  title,
  excerpt,
  section,
  author,
  publishedAt,
  url,
  __stackpage,
  onClick,
}) => {
  const handleClick = () => {
    __stackpage?.emit('select', { id: title, title, contentType: 'news', source: 'secondary-article-card' });
    onClick?.();
  };

  return (
    <article
      className="group cursor-pointer border-b border-gray-100 px-2 sm:px-0 py-3 last:border-b-0 hover:bg-gray-50/50"
      onClick={handleClick}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* ── Section color dot ── */}
        {section && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
        )}

        <div className="min-w-0 flex-1">
          {/* ── Section label ── */}
          {section && (
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-widest text-blue-600">
              {section}
            </span>
          )}

          {/* ── Headline ── */}
          <h3 className="font-serif text-base font-bold leading-snug text-gray-900 group-hover:text-blue-700">
            {url ? (
              <a href={url} className="hover:underline">{title}</a>
            ) : (
              title
            )}
          </h3>

          {/* ── Excerpt ── */}
          {excerpt && (
            <p className="mt-1 text-sm leading-relaxed text-gray-600 line-clamp-1">
              {excerpt}
            </p>
          )}
        </div>
      </div>

      {/* ── Byline ── */}
      {(author || publishedAt) && (
        <div className="ml-5 mt-1 flex items-center gap-2 text-xs text-gray-400">
          {author && <span className="font-medium text-gray-500">{author}</span>}
          {author && publishedAt && <span>·</span>}
          {publishedAt && <span>{publishedAt}</span>}
        </div>
      )}
    </article>
  );
};

export default SecondaryArticleCard;
