import React from 'react';
import { getVerticalTheme, verticalDotClass, getDefaultWritingMode } from './themes';
import VerticalTextContainer from './VerticalTextContainer';
import type { ContentType, WritingMode } from './types';
import type { StackPageRuntimeApi } from './types';

export interface NewsArticleCardProps {
  title: string;
  excerpt: string;
  image?: string;
  contentType?: ContentType;
  section?: string;
  author?: string;
  avatar?: string;
  publishedAt?: string;
  featured?: boolean;
  writingMode?: WritingMode;
  __stackpage?: StackPageRuntimeApi;
}

const NewsArticleCard: React.FC<NewsArticleCardProps> = ({
  title,
  excerpt,
  image,
  contentType = 'news',
  section,
  author,
  avatar,
  publishedAt,
  featured = false,
  writingMode,
  __stackpage,
}) => {
  const wm = writingMode ?? getDefaultWritingMode(contentType);
  const theme = getVerticalTheme(contentType);
  const dotClass = verticalDotClass(contentType);
  const handleClick = () => {
    __stackpage?.emit('select', { id: '', title, contentType, source: 'news-card' });
  };

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md border-t-[3px] border-t-blue-500 ${
        featured ? 'md:col-span-2' : ''
      }`}
      onClick={handleClick}
    >
      {image && (
        <div className="relative w-full overflow-hidden aspect-[16/9]">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {section && (
            <span className={`absolute left-3 top-3 rounded px-2 py-0.5 text-xs font-semibold text-white ${theme.badgeBg}`}>
              {section}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
          {section || 'News'}
        </span>
        <VerticalTextContainer writingMode={wm}>
          <h3 className={`mb-1.5 font-semibold leading-snug text-gray-900 group-hover:text-blue-600 ${
            featured ? 'text-lg md:text-xl' : 'text-base md:text-lg'
          }`}>
            {title}
          </h3>
          <p className="mb-3 text-sm leading-relaxed text-gray-600 line-clamp-2">{excerpt}</p>
        </VerticalTextContainer>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            {avatar && (
              <img src={avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
            )}
            {author && <span className="font-medium text-gray-500">{author}</span>}
          </div>
          <span>{publishedAt}</span>
        </div>
      </div>
    </article>
  );
};

export default NewsArticleCard;
