import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface PrimaryArticleCardProps {
  /** Article headline */
  title: string;
  /** Article excerpt / summary */
  excerpt?: string;
  /** Article image URL (optional) */
  image?: string;
  /** Newspaper section label (e.g. "Politics", "Economy") */
  section?: string;
  /** Left border accent color (Tailwind class). Auto-mapped from section if omitted */
  sectionColor?: string;
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

/** Default section → border color mapping */
const SECTION_COLORS: Record<string, string> = {
  politics: 'border-l-blue-700',
  economy: 'border-l-emerald-600',
  international: 'border-l-indigo-600',
  society: 'border-l-purple-600',
  culture: 'border-l-pink-600',
  sports: 'border-l-amber-600',
  opinion: 'border-l-red-600',
  business: 'border-l-emerald-600',
  technology: 'border-l-cyan-600',
  science: 'border-l-teal-600',
  health: 'border-l-green-600',
};

function getSectionColor(section?: string, customColor?: string): string {
  if (customColor) return customColor;
  if (!section) return 'border-l-gray-400';
  return SECTION_COLORS[section.toLowerCase()] || 'border-l-gray-400';
}

/**
 * PrimaryArticleCard — a medium-prominence news article card.
 *
 * Used for secondary lead articles and section-front stories.
 * Features a left border accent (section color), serif headline,
 * uppercase section label, and byline.
 */
const PrimaryArticleCard: React.FC<PrimaryArticleCardProps> = ({
  title,
  excerpt,
  image,
  section,
  sectionColor,
  author,
  publishedAt,
  url,
  __stackpage,
  onClick,
}) => {
  const handleClick = () => {
    __stackpage?.emit('select', { id: title, title, contentType: 'news', source: 'primary-article-card' });
    onClick?.();
  };

  const borderColor = getSectionColor(section, sectionColor);

  return (
    <article
      className={`group cursor-pointer border-l-4 ${borderColor} bg-white p-3 sm:p-4 w-full transition-shadow hover:shadow-sm`}
      onClick={handleClick}
    >
      {/* ── Section Label ── */}
      {section && (
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-blue-700">
          {section}
        </span>
      )}

      {/* ── Image (optional) ── */}
      {image && (
        <div className="mb-2 overflow-hidden rounded">
          <img
            src={image}
            alt={title}
            className="h-32 sm:h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* ── Headline ── */}
      <h3 className="mb-1 font-serif text-lg font-bold leading-tight text-gray-900 group-hover:text-blue-700">
        {url ? (
          <a href={url} className="hover:underline">
            {title}
          </a>
        ) : (
          title
        )}
      </h3>

      {/* ── Excerpt ── */}
      {excerpt && (
        <p className="mb-2 text-sm leading-relaxed text-gray-600 line-clamp-2">
          {excerpt}
        </p>
      )}

      {/* ── Byline ── */}
      {(author || publishedAt) && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {author && <span className="font-medium text-gray-500">{author}</span>}
          {author && publishedAt && <span>·</span>}
          {publishedAt && <span>{publishedAt}</span>}
        </div>
      )}
    </article>
  );
};

export default PrimaryArticleCard;
