import React from 'react';
import VerticalTextContainer from './VerticalTextContainer';
import { verticalDotClass } from './themes';
import type { ContentType, WritingMode } from './types';
import type { StackPageRuntimeApi } from './types';

export interface ContentCardProps {
  title: string;
  excerpt: string;
  image?: string;
  contentType?: ContentType;
  category?: string;
  section?: string;
  author?: string;
  authorAvatar?: string;
  publishedAt?: string;
  featured?: boolean;
  writingMode?: WritingMode;
  format?: string;
  price?: string;
  startDate?: string;
  location?: string;
  seriesName?: string;
  chapterNumber?: number;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
  onClick?: () => void;
}

const contentTypeBorder: Record<string, string> = {
  news: 'border-t-blue-500',
  government: 'border-t-emerald-500',
  publication: 'border-t-purple-500',
  comic: 'border-t-orange-500',
  entertainment: 'border-t-pink-500',
};

const contentTypeLabels: Record<string, string> = {
  news: 'News',
  government: 'Gov',
  publication: 'Book',
  comic: 'Comic',
  entertainment: 'Event',
};

const contentTypeChipBg: Record<string, string> = {
  news: 'bg-blue-50 text-blue-700',
  government: 'bg-emerald-50 text-emerald-700',
  publication: 'bg-purple-50 text-purple-700',
  comic: 'bg-orange-50 text-orange-700',
  entertainment: 'bg-pink-50 text-pink-700',
};

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  excerpt,
  image,
  contentType,
  author,
  authorAvatar,
  publishedAt,
  featured = false,
  writingMode,
  format,
  price,
  seriesName,
  chapterNumber,
  __stackpage,
  onClick,
}) => {
  // Cards are compact — always use horizontal writing; vertical mode is for full articles only
  const wm = writingMode ?? 'horizontal-tb';
  const handleClick = () => {
    __stackpage?.emit('select', { id: '', title, contentType, source: 'content-card' });
    onClick?.();
  };
  const borderColor = contentType ? contentTypeBorder[contentType] || 'border-t-gray-400' : 'border-t-gray-400';
  const dotClass = contentType ? verticalDotClass(contentType) : 'bg-gray-400';
  const label = contentType ? contentTypeLabels[contentType] || contentType : '';
  const chipClass = contentType ? contentTypeChipBg[contentType] || 'bg-gray-50 text-gray-700' : 'bg-gray-50 text-gray-700';
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 border-t-[3px] ${borderColor} ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
    >
      {image && (
        <div className={`relative w-full overflow-hidden ${
          contentType === 'publication' || contentType === 'comic'
            ? 'aspect-[3/4] max-h-64'
            : 'h-44 sm:h-48 md:h-52'
        }`}>
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {featured && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          )}
          {label && (
            <span className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${chipClass}`}>
              {label}
            </span>
          )}
          {price && (
            <span className="absolute right-3 top-3 z-10 rounded bg-white/90 px-2 py-0.5 text-xs font-bold text-gray-800 shadow-sm">
              {price}
            </span>
          )}
        </div>
      )}
      <div className={`flex flex-1 flex-col ${image ? 'p-4 sm:p-5' : 'p-3 sm:p-4'}`}>
        {/* Content type label (when no image to show it on) */}
        {label && !image && (
          <span className={`mb-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${chipClass}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} />
            {label}
          </span>
        )}
        {seriesName && chapterNumber !== undefined && (
          <p className="mb-1 text-xs text-gray-400 font-medium">{seriesName} · Ch. {chapterNumber}</p>
        )}
        <VerticalTextContainer writingMode={wm}>
          <h3 className={`mb-2 font-semibold leading-snug text-gray-900 group-hover:text-blue-600 transition-colors ${
            !image ? 'text-sm md:text-base' : featured ? 'text-lg md:text-2xl md:font-bold' : 'text-base md:text-lg'
          }`}>
            {title}
          </h3>
          <p className={`mb-3 leading-relaxed text-gray-600 ${
            !image ? 'text-xs line-clamp-1' : featured ? 'text-sm md:text-base line-clamp-3' : 'text-sm line-clamp-2'
          }`}>{excerpt}</p>
        </VerticalTextContainer>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2 min-w-0">
            {authorAvatar && (
              <img src={authorAvatar} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
            )}
            {author && <span className="font-medium text-gray-500 truncate">{author}</span>}
            {format && (
              <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 font-medium">{format}</span>
            )}
          </div>
          <span className="shrink-0">{publishedAt}</span>
        </div>
      </div>
    </article>
  );
};

export default ContentCard;
