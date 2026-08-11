import React, { useRef, useEffect, useState } from 'react';
import VerticalTextContainer from './VerticalTextContainer';
import { getDefaultWritingMode } from './themes';
import type { ContentType, WritingMode } from './types';
import type { StackPageRuntimeApi } from './types';
import { toStringArray } from './utils';

export interface VerticalArticleProps {
  id?: string;
  title: string;
  content?: string;
  /** Alias used by generic Post bindings. */
  text?: string;
  /** Plain text excerpt/summary (shown in horizontal mode) */
  excerpt?: string;
  image?: string;
  contentType?: ContentType;
  category?: string;
  /** Author name(s), comma-separated */
  author?: string;
  authorAvatar?: string;
  authorAvatarAlt?: string;
  publishedAt?: string;
  showTitle?: boolean;
  showDate?: boolean;
  showAuthor?: boolean;
  showTags?: boolean;
  authorProfileUrl?: string;
  count?: {
    bookmarks?: number;
    favors?: number;
    forwards?: number;
    clicks?: number;
  };
  showCounts?: boolean;
  commentCount?: number;
  showComments?: boolean;
  commentsUrl?: string;
  tags?: string[];
  writingMode?: WritingMode;
  /** Column count for vertical text 段組み */
  columnCount?: number;
  /** Line width in characters (行幅) */
  lineWidth?: number;
  /** Font family preset exposed as a Page Builder dropdown. */
  fontFamily?: 'serif' | 'sans' | 'mincho' | 'gothic' | 'system';
  fontSize?: string;
  lineHeight?: string | number;
  paragraphMargin?: string;
  blockMargin?: string;
  columnGap?: string;
  columnHeight?: string;
  textOrientation?: 'mixed' | 'upright' | 'sideways';
  keepBlocksTogether?: boolean;
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

const FONT_FAMILIES: Record<NonNullable<VerticalArticleProps['fontFamily']>, string> = {
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  sans: 'ui-sans-serif, system-ui, sans-serif',
  mincho: '"Noto Serif JP", "Hiragino Mincho ProN", Yu Mincho, serif',
  gothic: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", Yu Gothic, sans-serif',
  system: 'inherit',
};

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
  id,
  title,
  content,
  text,
  image,
  contentType = 'publication',
  category,
  author,
  authorAvatar,
  authorAvatarAlt,
  publishedAt,
  showTitle = true,
  showDate = true,
  showAuthor = true,
  showTags = true,
  authorProfileUrl,
  count,
  showCounts = true,
  commentCount = 0,
  showComments = true,
  commentsUrl,
  tags,
  writingMode,
  columnCount = 2,
  lineWidth = 40,
  fontFamily = 'serif',
  fontSize = '1rem',
  lineHeight = 1.8,
  paragraphMargin = '1em',
  blockMargin = '1.5rem',
  columnGap = '2.5rem',
  columnHeight = '70vh',
  textOrientation = 'mixed',
  keepBlocksTogether = true,
  prevArticle,
  nextArticle,
  seriesName,
  chapterNumber,
  totalChapters,
  extraMeta,
  __stackpage,
  onClick,
}) => {
  const bodyText = content ?? text ?? '';
  const wm = writingMode ?? getDefaultWritingMode(contentType);
  const isVertical = wm === 'vertical-rl' || wm === 'vertical-lr';
  const normalizedTags = toStringArray(tags);
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

  const readingTime = estimateReadingTime(bodyText + ' ' + title);
  const handleSelect = () => {
    __stackpage?.emit('select', {
      id: id || title, title, contentType: contentType || 'publication',
      source: 'vertical-article',
    });
    onClick?.();
  };

  return (
    <article
      className="mx-auto max-w-5xl"
      onClick={handleSelect}
      style={{
        fontFamily: FONT_FAMILIES[fontFamily],
        fontSize,
        ['--vertical-block-margin' as string]: blockMargin,
      } as React.CSSProperties}
    >
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
      {showTitle && <h1
        className={`mb-4 font-bold leading-tight text-gray-900 ${
          isVertical ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
        }`}
        style={isVertical ? {
          writingMode: wm,
          textOrientation,
          lineHeight,
          letterSpacing: '0.08em',
          maxHeight: '12em',
          display: 'inline-block',
        } : undefined}
      >
        {title}
      </h1>}

      {/* ── Author & Date Meta ── */}
      <div className={`flex flex-wrap items-center gap-3 text-sm text-gray-500 ${
        isVertical ? 'mb-4' : 'mb-6'
      }`}>
        {showAuthor && authorAvatar && (
          <img
            src={authorAvatar}
            alt={authorAvatarAlt || author || 'Author'}
            loading="lazy"
            className="h-9 w-9 rounded-full object-cover"
          />
        )}
        {showAuthor && (authorProfileUrl ? (
          <a href={authorProfileUrl} className="font-medium text-blue-700 hover:underline">
            {author || 'Author'}
          </a>
        ) : author && <span className="font-medium">{author}</span>)}
        {showDate && publishedAt && (
          <>
            <span className="text-gray-300">·</span>
            <span>{publishedAt}</span>
          </>
        )}
      </div>

      {showCounts && count && (
        <section className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500" aria-label="Post counts">
          {Object.entries(count).map(([label, value]) => (
            <span key={label} className="rounded-full bg-gray-100 px-3 py-1">
              {label}: {Number(value) || 0}
            </span>
          ))}
        </section>
      )}

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
        <figure className={`${isVertical ? 'mb-6 float-right ml-6 w-2/5 md:w-1/3' : 'mb-8 w-full'}`}>
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-auto w-full rounded-lg object-cover shadow-sm"
          />
          {isVertical && (
            <figcaption className="mt-1 text-[10px] text-gray-400 text-right">
              {title}
            </figcaption>
          )}
        </figure>
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
          columnGap={columnGap}
          columnHeight={columnHeight}
          lineWidth={isVertical ? lineWidth : undefined}
          lineHeight={lineHeight}
          paragraphMargin={paragraphMargin}
          textOrientation={textOrientation}
          keepBlocksTogether={keepBlocksTogether}
        >
          <div
            className={`vertical-article-body prose max-w-none text-gray-700 ${
              isVertical
                ? 'prose-sm prose-headings:text-lg prose-headings:font-bold'
                : 'prose-lg'
            }`}
            style={{ marginBlock: blockMargin }}
            dangerouslySetInnerHTML={{ __html: bodyText }}
          />
        </VerticalTextContainer>
      </div>

      {/* ── Tags ── */}
      {showTags && normalizedTags.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${
          isVertical ? 'mt-4' : 'mt-8'
        }`}>
          {normalizedTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {showComments && (
        <section className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-600" aria-label="Comments">
          {commentsUrl ? (
            <a href={commentsUrl} className="text-blue-700 hover:underline">
              Comments ({commentCount})
            </a>
          ) : (
            <span>Comments ({commentCount})</span>
          )}
        </section>
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
