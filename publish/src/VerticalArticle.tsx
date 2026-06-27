import React, { useRef, useEffect, useState } from 'react';
import VerticalTextContainer from './VerticalTextContainer';
import { getDefaultWritingMode } from './themes';
import type { ContentType, WritingMode } from './types';
import type { StackPageRuntimeApi } from './types';

export interface VerticalArticleProps {
  title: string;
  content: string;
  /** Plain text excerpt/summary (shown in horizontal mode) */
  excerpt?: string;
  image?: string;
  contentType?: ContentType;
  category?: string;
  /** Author name(s), comma-separated */
  author?: string;
  publishedAt?: string;
  tags?: string[];
  writingMode?: WritingMode;
  /** Column count for vertical text 段組み */
  columnCount?: number;
  /** Line width in characters (行幅) */
  lineWidth?: number;
  /** Previous article navigation */
  prevArticle?: { id: string; title: string; url?: string };
  /** Next article navigation */
  nextArticle?: { id: string; title: string; url?: string };
  /** Series name for serialized content */
  seriesName?: string;
  /** Chapter number for series */
  chapterNumber?: number;
  /** Total chapters */
  totalChapters?: number;
  /** Extra header metadata items */
  extraMeta?: { label: string; value: string }[];

  // StackPage integration
  __stackpage?: StackPageRuntimeApi;
  onClick?: () => void;
}

/** Estimate reading time in minutes from text length */
function estimateReadingTime(text: string, wpm = 400): string {
  const chars = text.replace(/<[^>]*>/g, '').length;
  const min = Math.max(1, Math.round(chars / (wpm * 2)));
  return `${min} min read`;
}

/**
 * VerticalArticle — a full article reading page optimized for Japanese
 * vertical writing (縦書き/tategaki). Features:
 *
 * - Title rendered with proper vertical typography
 * - Article body in multi-column vertical-rl layout
 * - Ruby (furigana) annotation support via <ruby> HTML tags
 * - Reading progress indicator
 * - Previous/next article navigation
 * - Estimated reading time
 * - Series/chapter metadata for serialized content
 *
 * For horizontal reading, set writingMode="horizontal-tb" or use
 * getDefaultWritingMode(contentType) which returns 'vertical-rl'
 * for 'publication' and 'comic' types.
 */
const VerticalArticle: React.FC<VerticalArticleProps> = ({
  title,
  content,
  image,
  contentType = 'publication',
  category,
  author,
  publishedAt,
  tags,
  writingMode,
  columnCount = 2,
  lineWidth = 40,
  prevArticle,
  nextArticle,
  seriesName,
  chapterNumber,
  totalChapters,
  extraMeta,
  __stackpage,
  onClick,
}) => {
  const wm = writingMode ?? getDefaultWritingMode(contentType);
  const isVertical = wm === 'vertical-rl' || wm === 'vertical-lr';
  const articleRef = useRef<HTMLDivElement>(null);
  const [readProgress, setReadProgress] = useState(0);

  // Track reading progress via scroll
  useEffect(() => {
    const el = articleRef.current;
    if (!el || !isVertical) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) {
        setReadProgress(100);
        return;
      }
      setReadProgress(Math.round((scrollTop / maxScroll) * 100));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [isVertical]);

  const readingTime = estimateReadingTime(content + ' ' + title);
  const handleSelect = () => {
    __stackpage?.emit('publish:content:selected', {
      id: '', title, contentType: contentType || 'publication',
      source: 'vertical-article',
    });
    onClick?.();
  };

  return (
    <article className="mx-auto max-w-5xl" onClick={handleSelect}>
      {/* ── Reading Progress Bar ── */}
      {isVertical && (
        <div className="fixed left-0 top-0 z-50 h-1 w-full bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-200"
            style={{ width: `${readProgress}%` }}
          />
        </div>
      )}

      {/* ── Category Badge + Reading Time ── */}
      <div className={`flex items-center gap-3 ${isVertical ? 'mb-6' : 'mb-4'}`}>
        {category && (
          <span className="inline-block rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            {category}
          </span>
        )}
        <span className="text-xs text-gray-400">{readingTime}</span>
        {seriesName && chapterNumber !== undefined && (
          <span className="text-xs text-gray-400">
            · {seriesName} Ch.{chapterNumber}{totalChapters ? `/${totalChapters}` : ''}
          </span>
        )}
      </div>

      {/* ── Title Area ── */}
      <VerticalTextContainer writingMode={wm} lineWidth={lineWidth}>
        <h1 className={`mb-4 font-bold leading-tight text-gray-900 ${
          isVertical ? 'text-2xl md:text-3xl [writing-mode:vertical-rl]' : 'text-3xl md:text-4xl'
        }`}>
          {title}
        </h1>
      </VerticalTextContainer>

      {/* ── Author & Date Meta ── */}
      <div className={`flex flex-wrap items-center gap-3 text-sm text-gray-500 ${
        isVertical ? 'mb-4' : 'mb-6'
      }`}>
        {author && <span className="font-medium">{author}</span>}
        {publishedAt && (
          <>
            <span className="text-gray-300">·</span>
            <span>{publishedAt}</span>
          </>
        )}
      </div>

      {/* ── Extra Meta Block ── */}
      {extraMeta && extraMeta.length > 0 && (
        <div className={`flex flex-wrap gap-4 text-sm text-gray-600 ${
          isVertical ? 'mb-4' : 'mb-6'
        }`}>
          {extraMeta.map((meta, i) => (
            <span key={i}>
              <span className="font-semibold">{meta.label}:</span> {meta.value}
            </span>
          ))}
        </div>
      )}

      {/* ── Hero Image ── */}
      {image && (
        <div className={`${isVertical ? 'mb-6 inline-block w-1/3' : 'mb-8'}`}>
          <img
            src={image}
            alt={title}
            className="h-auto w-full rounded-lg object-cover"
          />
        </div>
      )}

      {/* ── Article Content ── */}
      <div
        ref={articleRef}
        className={`${
          isVertical
            ? 'max-h-[70vh] overflow-y-auto border border-gray-200 bg-white p-6 rounded-lg'
            : ''
        }`}
      >
        <VerticalTextContainer
          writingMode={wm}
          columnCount={isVertical ? columnCount : 1}
          lineWidth={isVertical ? lineWidth : undefined}
        >
          <div
            className={`prose max-w-none text-gray-700 ${
              isVertical
                ? 'prose-sm prose-headings:text-lg prose-headings:font-bold'
                : 'prose-lg'
            }`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </VerticalTextContainer>
      </div>

      {/* ── Tags ── */}
      {tags && tags.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${
          isVertical ? 'mt-4' : 'mt-8'
        }`}>
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

      {/* ── Series Progress ── */}
      {seriesName && chapterNumber !== undefined && totalChapters && totalChapters > 1 && (
        <div className={`${isVertical ? 'mt-4' : 'mt-8'}`}>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{seriesName}</span>
            <span className="text-gray-300">·</span>
            <span>Chapter {chapterNumber} of {totalChapters}</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${(chapterNumber / totalChapters) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Previous / Next Navigation ── */}
      {(prevArticle || nextArticle) && (
        <nav className={`flex items-center justify-between border-t border-gray-200 ${
          isVertical ? 'mt-4 pt-4' : 'mt-8 pt-6'
        }`}>
          <div>
            {prevArticle && (
              <a
                href={prevArticle.url || '#'}
                className="group flex flex-col text-sm"
              >
                <span className="text-xs text-gray-400">← Previous</span>
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  {prevArticle.title}
                </span>
              </a>
            )}
          </div>
          <div className="text-right">
            {nextArticle && (
              <a
                href={nextArticle.url || '#'}
                className="group flex flex-col text-sm"
              >
                <span className="text-xs text-gray-400">Next →</span>
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  {nextArticle.title}
                </span>
              </a>
            )}
          </div>
        </nav>
      )}
    </article>
  );
};

export default VerticalArticle;
