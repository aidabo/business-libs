import React from 'react';
import VerticalTextContainer from './VerticalTextContainer';
import { getDefaultWritingMode, verticalDotClass } from './themes';
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
  const wm = writingMode ?? getDefaultWritingMode(contentType);
  const handleClick = () => {
    __stackpage?.emit('select', { id: '', title, contentType, source: 'content-card' });
    onClick?.();
  };
  const borderColor = contentType ? contentTypeBorder[contentType] || 'border-t-gray-400' : 'border-t-gray-400';
  const dotClass = contentType ? verticalDotClass(contentType) : 'bg-gray-400';
  const label = contentType ? contentTypeLabels[contentType] || contentType : '';
  const imageAspect = contentType === 'publication' || contentType === 'comic' ? 'aspect-[3/4]' : 'aspect-[16/9]';

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md border-t-[3px] ${borderColor} ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
      onClick={handleClick}
    >
      {image && (
        <div className={`relative w-full overflow-hidden ${imageAspect}`}>
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {price && (
            <span className="absolute right-3 top-3 rounded bg-white/90 px-2 py-0.5 text-xs font-bold text-gray-800">
              {price}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        {label && (
          <span className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
            {label}
          </span>
        )}
        {seriesName && chapterNumber !== undefined && (
          <p className="mb-1 text-xs text-gray-400">{seriesName} · Ch. {chapterNumber}</p>
        )}
        <VerticalTextContainer writingMode={wm}>
          <h3 className="mb-1.5 text-base font-semibold leading-snug text-gray-900 group-hover:text-blue-600 md:text-lg md:font-bold">
            {title}
          </h3>
          <p className="mb-3 text-sm leading-relaxed text-gray-600 line-clamp-2">{excerpt}</p>
        </VerticalTextContainer>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            {authorAvatar && (
              <img src={authorAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
            )}
            {author && <span className="font-medium text-gray-500">{author}</span>}
            {format && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">{format}</span>
            )}
          </div>
          <span>{publishedAt}</span>
        </div>
      </div>
    </article>
  );
};

export default ContentCard;
