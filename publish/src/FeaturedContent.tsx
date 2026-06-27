import React from 'react';
import type { ContentType } from './types';

export interface FeaturedContentProps {
  title: string;
  excerpt: string;
  image?: string;
  contentType?: ContentType;
  category?: string;
  author?: string;
  publishedAt?: string;
  badgeText?: string;
  secondaryAction?: string;
  onClick?: () => void;
  onSecondaryAction?: () => void;
}

const FeaturedContent: React.FC<FeaturedContentProps> = ({
  title,
  excerpt,
  image,
  contentType: _contentType,
  category,
  author,
  publishedAt,
  badgeText,
  secondaryAction,
  onClick,
  onSecondaryAction,
}) => {
  return (
    <section
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-gray-900 shadow-lg"
      onClick={onClick}
    >
      {image && (
        <div className="absolute inset-0">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-70"
          />
        </div>
      )}
      <div className="relative flex min-h-[400px] items-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-8 md:p-12">
        <div className="max-w-2xl">
          {category && (
            <span className="mb-3 inline-block rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              {category}
            </span>
          )}
          {badgeText && (
            <span className="mb-3 ml-2 inline-block rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              {badgeText}
            </span>
          )}
          <h2 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-200">{excerpt}</p>
          <div className="flex items-center gap-4">
            {(author || publishedAt) && (
              <div className="flex items-center gap-3 text-sm text-gray-300">
                {author && <span>{author}</span>}
                {publishedAt && <span>· {publishedAt}</span>}
              </div>
            )}
            {secondaryAction && (
              <button
                onClick={(e) => { e.stopPropagation(); onSecondaryAction?.(); }}
                className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                {secondaryAction}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedContent;
