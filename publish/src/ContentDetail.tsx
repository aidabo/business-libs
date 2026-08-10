import React from 'react';
import VerticalTextContainer from './VerticalTextContainer';
import { getDefaultWritingMode } from './themes';
import { useT } from './contexts/PublishContext';
import type { ContentType, WritingMode } from './types';
import { toStringArray } from './utils';

export interface ContentDetailProps {
  title: string;
  content?: string;
  image?: string;
  contentType?: ContentType;
  category?: string;
  author?: string;
  publishedAt?: string;
  tags?: string[];
  writingMode?: WritingMode;
  // Publication extras
  isbn?: string;
  publisher?: string;
  pageCount?: number;
  price?: string;
  // Comic extras
  seriesName?: string;
  chapterNumber?: number;
  totalChapters?: number;
  // Event extras
  startDate?: string;
  endDate?: string;
  location?: string;
  ticketUrl?: string;
}

const ContentDetail: React.FC<ContentDetailProps> = ({
  title,
  content,
  image,
  contentType: _contentType,
  category,
  author,
  publishedAt,
  tags,
  writingMode,
  isbn,
  publisher,
  pageCount,
  price,
  seriesName,
  chapterNumber,
  totalChapters,
  startDate,
  endDate,
  location,
  ticketUrl,
}) => {
  const t = useT();
  const wm = writingMode ?? getDefaultWritingMode(_contentType);
  const normalizedTags = toStringArray(tags);

  return (
    <article className="mx-auto max-w-3xl">
      {category && (
        <span className="mb-4 inline-block rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          {category}
        </span>
      )}
      <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
        {title}
      </h1>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        {author && <span>{author}</span>}
        {publishedAt && <span>· {publishedAt}</span>}
        {seriesName && chapterNumber !== undefined && (
          <span>· {seriesName} Ch.{chapterNumber}{totalChapters ? `/${totalChapters}` : ''}</span>
        )}
        {price && <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">{price}</span>}
      </div>
      {image && (
        <img src={image} alt={title} className="mb-8 h-auto w-full rounded-lg object-cover" />
      )}
      {/* Meta info block */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-600">
        {publisher && <span>{t('Publisher')}: {publisher}</span>}
        {isbn && <span>{t('ISBN')}: {isbn}</span>}
        {pageCount && <span>{t('Pages')}: {pageCount}</span>}
        {startDate && <span>{t('Start')}: {startDate}</span>}
        {endDate && <span>{t('End')}: {endDate}</span>}
        {location && <span>{t('Location')}: {location}</span>}
      </div>
      {content && (
        <VerticalTextContainer writingMode={wm} columnCount={2}>
          <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: content }} />
        </VerticalTextContainer>
      )}
      {ticketUrl && (
        <div className="mt-6">
          <a
            href={ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {t('Get tickets')}
          </a>
        </div>
      )}
      {normalizedTags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {normalizedTags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default ContentDetail;
