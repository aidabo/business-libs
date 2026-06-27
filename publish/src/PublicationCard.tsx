import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface PublicationCardProps {
  title: string;
  coverImage?: string;
  author?: string;
  publisher?: string;
  format?: string;
  price?: string;
  description?: string;
  rating?: number;
  __stackpage?: StackPageRuntimeApi;
}

const PublicationCard: React.FC<PublicationCardProps> = ({
  title,
  coverImage,
  author,
  publisher,
  format,
  price,
  description,
  rating,
  __stackpage,
}) => {
  const handleClick = () => {
    __stackpage?.emit('select', { id: '', title, source: 'publication-card' });
  };

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md border-t-[3px] border-t-purple-500 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative w-full overflow-hidden aspect-[3/4] bg-purple-50">
        {coverImage && (
          <img
            src={coverImage}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {!coverImage && (
          <div className="flex h-full items-center justify-center">
            <svg className="h-12 w-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        {format && (
          <span className="absolute right-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-gray-600">
            {format}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 text-base font-semibold leading-snug text-gray-900 group-hover:text-purple-600">
          {title}
        </h3>
        {author && <p className="text-sm text-gray-500">{author}</p>}
        {rating !== undefined && (
          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={`text-xs ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
        )}
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-2">{description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-gray-400">
          {publisher && <span>{publisher}</span>}
          {price && <span className="font-bold text-gray-800">{price}</span>}
        </div>
      </div>
    </article>
  );
};

export default PublicationCard;
