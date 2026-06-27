import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface EditorialCardProps {
  /** Columnist/editorial author name */
  author: string;
  /** Author photo URL */
  authorImage?: string;
  /** Author title/role (e.g. "Senior Editor", "Guest Columnist") */
  authorTitle?: string;
  /** Editorial headline or topic */
  title: string;
  /** Editorial body excerpt or pull quote */
  excerpt?: string;
  /** Full article URL */
  url?: string;
  /** Publication date */
  publishedAt?: string;
  /** Label variant (e.g. "OPINION", "EDITORIAL", "ANALYSIS") */
  label?: string;

  // StackPage integration
  __stackpage?: StackPageRuntimeApi;
  onClick?: () => void;
}

/**
 * EditorialCard — opinion/editorial column card.
 *
 * Features a prominent author section with photo and credentials,
 * a highlighted quote or headline, and an optional label.
 * Designed for newspaper opinion/editorial sections.
 */
const EditorialCard: React.FC<EditorialCardProps> = ({
  author,
  authorImage,
  authorTitle,
  title,
  excerpt,
  url,
  publishedAt,
  label = 'OPINION',
  __stackpage,
  onClick,
}) => {
  const handleClick = () => {
    __stackpage?.emit('select', { id: title, title, contentType: 'news', source: 'editorial-card' });
    onClick?.();
  };

  return (
    <article
      className="group cursor-pointer border border-gray-200 bg-white p-4 sm:p-5 transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      {/* ── Label ── */}
      <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
        {label}
      </span>

      {/* ── Author section ── */}
      <div className="mb-3 flex items-center gap-3 flex-wrap">
        {authorImage && (
          <img
            src={authorImage}
            alt={author}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-serif text-base font-bold text-gray-900">{author}</p>
          {authorTitle && (
            <p className="text-xs text-gray-500">{authorTitle}</p>
          )}
        </div>
      </div>

      {/* ── Title ── */}
      <h3 className="mb-2 font-serif text-lg font-bold leading-snug text-gray-900 group-hover:text-red-700">
        {url ? (
          <a href={url} className="hover:underline">{title}</a>
        ) : (
          title
        )}
      </h3>

      {/* ── Excerpt ── */}
      {excerpt && (
        <p className="mb-3 text-sm leading-relaxed text-gray-600 italic border-l-2 border-red-400 pl-3">
          &ldquo;{excerpt}&rdquo;
        </p>
      )}

      {/* ── Date ── */}
      {publishedAt && (
        <p className="text-xs text-gray-400">{publishedAt}</p>
      )}
    </article>
  );
};

export default EditorialCard;
