import React from 'react';
import type { ContentType, WritingMode } from './types';
import type { StackPageRuntimeApi } from './types';

export interface RelatedArticleItem {
  id: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  contentType?: string;
  author?: string;
  publishedAt?: string;
  url?: string;
}

export interface RelatedArticlesProps {
  title?: string;
  articles: RelatedArticleItem[];
  maxArticles?: number;
  columns?: 2 | 3 | 4;
  contentType?: ContentType;
  writingMode?: WritingMode;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

/**
 * RelatedArticles — displays a grid of related/suggested content articles.
 * Works with both horizontal and vertical writing modes.
 *
 * Designed for use at the bottom of article detail pages to suggest
 * further reading. Supports integration with StackPage runtime for
 * selection events and shared state.
 */
const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  title = 'Related Articles',
  articles,
  maxArticles = 6,
  columns = 3,
  contentType = 'news',
  selectedContentIdKey = 'publish.selectedContentId',
  __stackpage,
}) => {
  const displayArticles = articles.slice(0, maxArticles);

  if (displayArticles.length === 0) return null;

  const columnGrid = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  };

  const handleClick = (article: RelatedArticleItem) => {
    __stackpage?.emit('publish:content:selected', {
      id: article.id, title: article.title,
      contentType: article.contentType || contentType, source: 'related',
    });
    if (selectedContentIdKey) {
      __stackpage?.setState?.(selectedContentIdKey, article.id);
    }
  };

  return (
    <section className="my-8">
      <h2 className="mb-6 text-xl font-bold text-gray-900">{title}</h2>
      <div className={`grid gap-6 ${columnGrid[columns]}`}>
        {displayArticles.map((article) => (
          <a
            key={article.id}
            href={article.url || '#'}
            onClick={(e) => {
              if (!article.url) e.preventDefault();
              handleClick(article);
            }}
            className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
          >
            {article.image && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-4">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
                {article.category && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">
                    {article.category}
                  </span>
                )}
                {article.publishedAt && <span>{article.publishedAt}</span>}
              </div>
              <h3 className="mb-1 font-semibold leading-snug text-gray-900 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-sm leading-relaxed text-gray-500 line-clamp-2">
                  {article.excerpt}
                </p>
              )}
              {article.author && (
                <p className="mt-2 text-xs text-gray-400">{article.author}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;
