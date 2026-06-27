import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface LeadStoryProps {
  /** Main headline (大見出し) */
  title: string;
  /** Deck / subheadline (リード文) */
  deck?: string;
  /** Article body content (HTML) */
  content?: string;
  /** Main hero image URL */
  image?: string;
  /** Image caption */
  imageCaption?: string;
  /** Section category (e.g. "International", "Politics") */
  category?: string;
  /** Badge label (e.g. "BREAKING", "EXCLUSIVE", "ANALYSIS") */
  badgeText?: string;
  /** Badge color variant */
  badgeColor?: 'red' | 'blue' | 'amber' | 'green';
  /** Author name */
  author?: string;
  /** Author avatar image URL */
  authorAvatar?: string;
  /** Publication date */
  publishedAt?: string;
  /** Body text column count (1-3) — traditional newspaper uses 2 */
  columnCount?: 1 | 2 | 3;
  /** Pull quote inserted in the body */
  pullQuote?: { text: string; attribution?: string };
  /** Secondary inline image */
  relatedImage?: { url: string; caption?: string };
  /** Tags displayed below article */
  tags?: string[];

  // StackPage integration
  __stackpage?: StackPageRuntimeApi;
  onSelect?: () => void;
}

const badgeColorMap: Record<string, string> = {
  red: 'bg-red-600',
  blue: 'bg-blue-600',
  amber: 'bg-amber-600',
  green: 'bg-emerald-600',
};

/**
 * LeadStory — the top/lead article on a newspaper front page.
 *
 * Professional lead story layout with:
 * - Large headline (4xl on desktop)
 * - Deck/subheadline for summary
 * - Category badge with optional breaking/exclusive marker
 * - Author byline with avatar
 * - Multi-column body text (traditional newspaper 2-column layout)
 * - Pull quote section within the body
 * - Related image with caption
 * - Tags
 *
 * Emits `publish:content:selected` event for StackPage integration.
 */
const LeadStory: React.FC<LeadStoryProps> = ({
  title,
  deck,
  content,
  image,
  imageCaption,
  category,
  badgeText,
  badgeColor = 'red',
  author,
  authorAvatar,
  publishedAt,
  columnCount = 2,
  pullQuote,
  relatedImage,
  tags,
  __stackpage,
  onSelect,
}) => {
  const handleSelect = () => {
    __stackpage?.emit('select', { id: title, title, contentType: 'news', source: 'lead-story' });
    onSelect?.();
  };

  const colClass = columnCount === 1
    ? 'columns-1'
    : columnCount === 3
      ? 'columns-1 md:columns-3 gap-8'
      : 'columns-1 md:columns-2 gap-8';

  return (
    <article className="bg-white px-4 sm:px-6 py-6 md:py-8" onClick={handleSelect}>
      {/* ── Category + Badge ── */}
      <div className="mb-3 flex items-center gap-3">
        {category && (
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            {category}
          </span>
        )}
        {badgeText && (
          <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white ${
            badgeColorMap[badgeColor] || 'bg-red-600'
          }`}>
            {badgeText}
          </span>
        )}
      </div>

      {/* ── Headline ── */}
      <h1 className="mb-3 font-serif text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl">
        {title}
      </h1>

      {/* ── Deck ── */}
      {deck && (
        <p className="mb-4 text-lg leading-relaxed text-gray-600 md:text-xl">
          {deck}
        </p>
      )}

      {/* ── Byline ── */}
      {(author || publishedAt) && (
        <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
          {authorAvatar && (
            <img
              src={authorAvatar}
              alt={author || ''}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <div>
            {author && <span className="font-semibold text-gray-700">{author}</span>}
            {publishedAt && (
              <span className="ml-2 text-gray-400">· {publishedAt}</span>
            )}
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="mb-6 border-t border-gray-300" />

      {/* ── Hero Image ── */}
      {image && (
        <figure className="mb-6">
          <img
            src={image}
            alt={title}
            className="w-full rounded-lg object-cover"
          />
          {imageCaption && (
            <figcaption className="mt-1 text-xs italic text-gray-500">
              {imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* ── Body Content with Pull Quote ── */}
      {content && (
        <div className="mb-6">
          {/* If pullQuote exists, split body: insert quote after first paragraph */}
          {pullQuote ? (
            <div className={`${colClass} space-y-4`}>
              <div className="break-inside-avoid-column">
                <div
                  className="prose prose-lg max-w-none leading-relaxed text-gray-700 [column-span:all]"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          ) : (
            <div className={`${colClass} space-y-4`}>
              <div
                className="prose prose-lg max-w-none leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          )}

          {/* Pull Quote */}
          {pullQuote && (
            <aside className="my-8 border-l-4 border-blue-700 bg-gray-50 py-4 pl-6 pr-4">
              <blockquote className="font-serif text-xl italic leading-relaxed text-gray-800 md:text-2xl">
                &ldquo;{pullQuote.text}&rdquo;
              </blockquote>
              {pullQuote.attribution && (
                <cite className="mt-2 block text-sm font-semibold not-italic text-gray-500">
                  — {pullQuote.attribution}
                </cite>
              )}
            </aside>
          )}
        </div>
      )}

      {/* ── Related Image ── */}
      {relatedImage && (
        <figure className="mb-6">
          <img
            src={relatedImage.url}
            alt={relatedImage.caption || ''}
            className="w-full rounded-lg object-cover"
          />
          {relatedImage.caption && (
            <figcaption className="mt-1 text-xs italic text-gray-500">
              {relatedImage.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* ── Tags ── */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default LeadStory;
